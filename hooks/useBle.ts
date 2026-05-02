import { useState, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import {
  SERVICE_UUID,
  STATUS_UUID,
  SCHEDULE_UUID,
  FOOD_AMOUNT_UUID,
  MANUAL_FEED_UUID,
  CLOCK_UUID,
  bytesToBase64,
  base64ToBytes,
} from '../utils/bleConstants';

export type StatusData = {
  hour: number;
  minute: number;
  lidarMm: number;
  foodAmount: number;
  scheduleCount: number;
  nextHour: number;
  nextMinute: number;
};

export type ScheduleEntry = {
  index: number;
  hour: number;
  minute: number;
};

const manager = new BleManager();

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const api = Platform.Version as number;
  if (api < 31) {
    const r = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return r === PermissionsAndroid.RESULTS.GRANTED;
  }
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);
  return Object.values(results).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
}

export function useBle() {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const deviceRef = useRef<Device | null>(null);

  async function startScan() {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission denied', 'Bluetooth permissions are required to find the feeder.');
      return;
    }
    setDevices([]);
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setScanning(false);
        return;
      }
      if (device?.name) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }

  async function connect(device: Device) {
    manager.stopDeviceScan();
    setScanning(false);
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      deviceRef.current = connected;
      setConnectedDevice(connected);

      await readSchedule(connected);

      connected.monitorCharacteristicForService(SERVICE_UUID, STATUS_UUID, (error, char) => {
        if (error || !char?.value) return;
        const b = base64ToBytes(char.value);
        if (b.length < 8) return;
        const raw = b[2] | (b[3] << 8);
        const lidarMm = raw > 32767 ? raw - 65536 : raw;
        setStatus({
          hour: b[0],
          minute: b[1],
          lidarMm,
          foodAmount: b[4],
          scheduleCount: b[5],
          nextHour: b[6],
          nextMinute: b[7],
        });
      });
    } catch (e) {
      Alert.alert('Connection failed', String(e));
    }
  }

  async function readSchedule(device: Device) {
    try {
      const char = await device.readCharacteristicForService(SERVICE_UUID, SCHEDULE_UUID);
      if (!char.value) return;
      const b = base64ToBytes(char.value);
      const count = b[0];
      const entries: ScheduleEntry[] = [];
      for (let i = 0; i < count; i++) {
        entries.push({ index: i, hour: b[1 + i * 2], minute: b[2 + i * 2] });
      }
      setSchedule(entries);
    } catch {
      setSchedule([]);
    }
  }

  function disconnect() {
    deviceRef.current?.cancelConnection();
    deviceRef.current = null;
    setConnectedDevice(null);
    setStatus(null);
    setSchedule([]);
  }

  async function manualFeed(grams: number) {
    if (!deviceRef.current) return;
    await deviceRef.current.writeCharacteristicWithResponseForService(
      SERVICE_UUID, MANUAL_FEED_UUID, bytesToBase64([grams])
    );
  }

  async function setFoodAmount(grams: number) {
    if (!deviceRef.current) return;
    await deviceRef.current.writeCharacteristicWithResponseForService(
      SERVICE_UUID, FOOD_AMOUNT_UUID, bytesToBase64([grams])
    );
  }

  async function addScheduleEntry(hour: number, minute: number) {
    if (!deviceRef.current) return;
    await deviceRef.current.writeCharacteristicWithResponseForService(
      SERVICE_UUID, SCHEDULE_UUID, bytesToBase64([0x01, hour, minute])
    );
    await readSchedule(deviceRef.current);
  }

  async function removeScheduleEntry(index: number) {
    if (!deviceRef.current) return;
    await deviceRef.current.writeCharacteristicWithResponseForService(
      SERVICE_UUID, SCHEDULE_UUID, bytesToBase64([0x02, index])
    );
    await readSchedule(deviceRef.current);
  }

  async function syncClock() {
    if (!deviceRef.current) return;
    const now = new Date();
    await deviceRef.current.writeCharacteristicWithResponseForService(
      SERVICE_UUID, CLOCK_UUID, bytesToBase64([now.getHours(), now.getMinutes()])
    );
    setStatus((prev) =>
      prev ? { ...prev, hour: now.getHours(), minute: now.getMinutes() } : prev
    );
  }

  return {
    scanning,
    devices,
    connectedDevice,
    status,
    schedule,
    startScan,
    connect,
    disconnect,
    manualFeed,
    setFoodAmount,
    addScheduleEntry,
    removeScheduleEntry,
    syncClock,
  };
}
