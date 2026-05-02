import { useBle } from './hooks/useBle';
import ConnectScreen from './screens/ConnectScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const ble = useBle();

  if (ble.connectedDevice) {
    return (
      <HomeScreen
        deviceName={ble.connectedDevice.name ?? 'CatFeeder'}
        status={ble.status}
        schedule={ble.schedule}
        onDisconnect={ble.disconnect}
        onManualFeed={ble.manualFeed}
        onSetFoodAmount={ble.setFoodAmount}
        onAddSchedule={ble.addScheduleEntry}
        onRemoveSchedule={ble.removeScheduleEntry}
        onSyncClock={ble.syncClock}
      />
    );
  }

  return (
    <ConnectScreen
      scanning={ble.scanning}
      devices={ble.devices}
      onScan={ble.startScan}
      onConnect={ble.connect}
    />
  );
}
