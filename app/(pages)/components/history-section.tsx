import { Riwayat } from '@/lib/types';
import { formattedTime } from '@/lib/utils/format-time';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../css/style';

interface HistorySectionProps {
  history: Riwayat[];
  handleDeleteRiwayat: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, handleDeleteRiwayat }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.text}>Riwayat Pembacaan</Text>
      {history
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        .map((item, idx, arr) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {arr.length - idx}.
              </Text>
              <Text>R: {item.r}, G: {item.g}, B: {item.b}</Text>
              <Text>LDR: {item.ldr}, pH: {item.ph}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Time: {formattedTime(item.timestamp)}</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity onPress={() => handleDeleteRiwayat(item.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </View>
  );
};

export default HistorySection;