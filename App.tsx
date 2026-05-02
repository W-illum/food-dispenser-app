import { useState } from 'react';
import ConnectScreen from './screens/ConnectScreen';
import HomeScreen from './screens/HomeScreen';

type Device = {
  id: string;
  name: string;
};

export default function App() {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  if (connectedDevice) {
    return (
      <HomeScreen
        deviceName={connectedDevice.name}
        onDisconnect={() => setConnectedDevice(null)}
      />
    );
  }

  return <ConnectScreen onConnect={(device) => setConnectedDevice(device)} />;
}
