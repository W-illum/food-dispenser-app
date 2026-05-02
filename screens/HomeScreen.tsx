import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

type ScheduleEntry = {
  index: number;
  hour: number;
  minute: number;
};

type Props = {
  deviceName: string;
  onDisconnect: () => void;
};

const FAKE_SCHEDULE: ScheduleEntry[] = [
  { index: 0, hour: 7, minute: 0 },
  { index: 1, hour: 18, minute: 30 },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function HomeScreen({ deviceName, onDisconnect }: Props) {
  const [foodAmount, setFoodAmount] = useState(30);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(FAKE_SCHEDULE);

  function handleManualFeed() {
    Alert.alert('Manual Feed', `Dispensing ${foodAmount}g of food!`);
  }

  function handleRemoveSchedule(index: number) {
    setSchedule((prev) => prev.filter((e) => e.index !== index));
  }

  function handleAddSchedule() {
    Alert.alert('Coming soon', 'Time picker will go here');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Food Dispenser</Text>
          <Text style={styles.connected}>● {deviceName}</Text>
        </View>
        <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Status card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Time</Text>
            <Text style={styles.statusValue}>14:32</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Next feed</Text>
            <Text style={styles.statusValue}>18:30</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Food level</Text>
            <Text style={styles.statusValue}>72%</Text>
          </View>
        </View>
        <View style={styles.foodBar}>
          <View style={[styles.foodBarFill, { width: '72%' }]} />
        </View>
      </View>

      {/* Manual feed */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manual Feed</Text>
        <View style={styles.amountRow}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setFoodAmount((a) => Math.max(5, a - 5))}
          >
            <Text style={styles.stepButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.amountValue}>{foodAmount}g</Text>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setFoodAmount((a) => Math.min(100, a + 5))}
          >
            <Text style={styles.stepButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.feedButton} onPress={handleManualFeed}>
          <Text style={styles.feedButtonText}>Feed now</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <TouchableOpacity onPress={handleAddSchedule}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {schedule.length === 0 && (
          <Text style={styles.emptyText}>No feeding times set</Text>
        )}
        {schedule.map((entry) => (
          <View key={entry.index} style={styles.scheduleRow}>
            <Text style={styles.scheduleTime}>
              {pad(entry.hour)}:{pad(entry.minute)}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveSchedule(entry.index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  connected: {
    fontSize: 13,
    color: '#4caf50',
    marginTop: 2,
  },
  disconnectButton: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  disconnectText: {
    color: '#aaa',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  foodBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  foodBarFill: {
    height: '100%',
    backgroundColor: '#f0a500',
    borderRadius: 3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 24,
  },
  stepButton: {
    backgroundColor: '#2e2e45',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 26,
  },
  amountValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#f0a500',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  feedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    color: '#f0a500',
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a40',
  },
  scheduleTime: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  removeButton: {
    color: '#e05252',
    fontSize: 14,
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
