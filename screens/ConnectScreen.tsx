import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

type Device = {
  id: string;
  name: string;
};

const FAKE_DEVICES: Device[] = [
  { id: '1', name: 'Food Dispenser' },
  { id: '2', name: 'BLE_Unknown_A4F2' },
];

type Props = {
  onConnect: (device: Device) => void;
};

export default function ConnectScreen({ onConnect }: Props) {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  function handleScan() {
    setScanning(true);
    setDevices([]);
    setTimeout(() => {
      setDevices(FAKE_DEVICES);
      setScanning(false);
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>Feeder App</Text>
      <Text style={styles.subtitle}>Connect to your device</Text>

      <TouchableOpacity
        style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
        onPress={handleScan}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>Scan for devices</Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceRow}
            onPress={() => onConnect(item)}
          >
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.connectLabel}>Connect →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 40,
  },
  scanButton: {
    backgroundColor: '#f0a500',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    width: '100%',
  },
  deviceRow: {
    backgroundColor: '#1e1e30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
  },
  connectLabel: {
    color: '#f0a500',
    fontSize: 14,
    fontWeight: '600',
  },
});
