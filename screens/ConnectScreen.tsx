import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Device } from 'react-native-ble-plx';

type Props = {
  scanning: boolean;
  devices: Device[];
  onScan: () => void;
  onConnect: (device: Device) => void;
};

export default function ConnectScreen({ scanning, devices, onScan, onConnect }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>Food Dispenser</Text>
      <Text style={styles.subtitle}>Connect to your device</Text>

      <TouchableOpacity
        style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
        onPress={onScan}
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
