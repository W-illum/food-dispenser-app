import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StatusData, ScheduleEntry } from '../hooks/useBle';
import { lidarToPercent } from '../utils/bleConstants';
import ConfirmModal from '../components/ConfirmModal';

type Props = {
  deviceName: string;
  status: StatusData | null;
  schedule: ScheduleEntry[];
  onDisconnect: () => void;
  onManualFeed: (grams: number) => Promise<void>;
  onSetFoodAmount: (grams: number) => Promise<void>;
  onAddSchedule: (hour: number, minute: number) => Promise<void>;
  onRemoveSchedule: (index: number) => Promise<void>;
  onSyncClock: () => Promise<void>;
};

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function HomeScreen({
  deviceName,
  status,
  schedule,
  onDisconnect,
  onManualFeed,
  onSetFoodAmount,
  onAddSchedule,
  onRemoveSchedule,
  onSyncClock,
}: Props) {
  const [manualAmount, setManualAmount] = useState(30);
  const [scheduledAmount, setScheduledAmount] = useState(30);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [feedConfirmVisible, setFeedConfirmVisible] = useState(false);
  const [removeEntry, setRemoveEntry] = useState<ScheduleEntry | null>(null);
  const [inputHour, setInputHour] = useState('');
  const [inputMinute, setInputMinute] = useState('');
  const scheduledAmountInitialized = useRef(false);

  useEffect(() => {
    if (status?.foodAmount && !scheduledAmountInitialized.current) {
      setScheduledAmount(status.foodAmount);
      scheduledAmountInitialized.current = true;
    }
  }, [status?.foodAmount]);

  function handleManualFeed() {
    setFeedConfirmVisible(true);
  }

  function handleScheduledAmountChange(delta: number) {
    const next = Math.min(100, Math.max(5, scheduledAmount + delta));
    setScheduledAmount(next);
    onSetFoodAmount(next).catch(() => {});
  }

  function handleAddConfirm() {
    const h = parseInt(inputHour, 10);
    const m = parseInt(inputMinute, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      Alert.alert('Invalid time', 'Enter a valid hour (0–23) and minute (0–59).');
      return;
    }
    if (schedule.some((e) => e.hour === h && e.minute === m)) {
      Alert.alert('Already exists', `${pad(h)}:${pad(m)} is already in the schedule.`);
      return;
    }
    onAddSchedule(h, m).catch((e) => Alert.alert('Error', String(e)));
    setAddModalVisible(false);
    setInputHour('');
    setInputMinute('');
  }

  const foodLevel = status ? lidarToPercent(status.lidarMm) : 0;
  const hasStatus = status !== null;

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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Status</Text>
          <TouchableOpacity onPress={() => onSyncClock().catch(() => {})}>
            <Text style={styles.syncLabel}>Sync clock</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Time</Text>
            <Text style={styles.statusValue}>
              {hasStatus ? `${pad(status!.hour)}:${pad(status!.minute)}` : '--:--'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Next feed</Text>
            <Text style={styles.statusValue}>
              {hasStatus && status!.scheduleCount > 0
                ? `${pad(status!.nextHour)}:${pad(status!.nextMinute)}`
                : '--:--'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Food level</Text>
            <Text style={styles.statusValue}>
              {hasStatus && status!.lidarMm >= 0 ? `${foodLevel}%` : '--'}
            </Text>
          </View>
        </View>
        <View style={styles.foodBar}>
          <View style={[styles.foodBarFill, { width: `${foodLevel}%` as any }]} />
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <View style={styles.scheduleHeaderRight}>
            <TouchableOpacity onPress={() => handleScheduledAmountChange(-5)}>
              <Text style={styles.amountStepText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.amountInlineValue}>{scheduledAmount}g</Text>
            <TouchableOpacity onPress={() => handleScheduledAmountChange(5)}>
              <Text style={styles.amountStepText}>+</Text>
            </TouchableOpacity>
            {schedule.length < 4 && (
              <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButtonContainer}>
                <Text style={styles.addButton}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {schedule.length === 0 && (
          <Text style={styles.emptyText}>No feeding times set</Text>
        )}
        {schedule.map((entry) => (
          <View key={entry.index} style={styles.scheduleRow}>
            <Text style={styles.scheduleTime}>
              {pad(entry.hour)}:{pad(entry.minute)}
            </Text>
            <TouchableOpacity onPress={() => setRemoveEntry(entry)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Manual feed */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manual Feed</Text>
        <View style={styles.amountRow}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setManualAmount((a) => Math.max(5, a - 5))}
          >
            <Text style={styles.stepButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.amountValue}>{manualAmount}g</Text>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setManualAmount((a) => Math.min(100, a + 5))}
          >
            <Text style={styles.stepButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.feedButton} onPress={handleManualFeed}>
          <Text style={styles.feedButtonText}>Feed now</Text>
        </TouchableOpacity>
      </View>

      {/* Feed confirmation */}
      <ConfirmModal
        visible={feedConfirmVisible}
        title="Feed now?"
        message={`Dispense ${manualAmount}g of food?`}
        confirmText="Feed"
        onConfirm={() => {
          setFeedConfirmVisible(false);
          onManualFeed(manualAmount).catch((e) => Alert.alert('Error', String(e)));
        }}
        onCancel={() => setFeedConfirmVisible(false)}
      />

      {/* Remove schedule confirmation */}
      <ConfirmModal
        visible={removeEntry !== null}
        title="Remove feeding time?"
        message={removeEntry ? `${pad(removeEntry.hour)}:${pad(removeEntry.minute)} will be removed.` : ''}
        confirmText="Remove"
        destructive
        onConfirm={() => {
          if (removeEntry) {
            onRemoveSchedule(removeEntry.index).catch((e) => Alert.alert('Error', String(e)));
          }
          setRemoveEntry(null);
        }}
        onCancel={() => setRemoveEntry(null)}
      />

      {/* Add time modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add feeding time</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={2}
                value={inputHour}
                onChangeText={setInputHour}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={2}
                value={inputMinute}
                onChangeText={setInputMinute}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddConfirm}>
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  syncLabel: {
    color: '#f0a500',
    fontSize: 13,
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
  scheduleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountStepText: {
    color: '#f0a500',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  amountInlineValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
  addButtonContainer: {
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#444',
    paddingLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 24,
    width: 280,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#2e2e45',
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 70,
    paddingVertical: 10,
    borderRadius: 10,
  },
  timeSeparator: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#aaa',
    fontSize: 15,
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#f0a500',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
