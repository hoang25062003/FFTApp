import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Nutrient {
  label: string;
  value: string;
}

interface HealthGoalCardProps {
  name: string;
  description: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  nutrients: Nutrient[];
}

const HealthGoalCard: React.FC<HealthGoalCardProps> = ({ name, description, priority, nutrients }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.goalName}>{name}</Text>
          <Text style={styles.goalDesc}>{description}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}><Text style={{fontSize: 18}}>✏️</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={{fontSize: 18}}>🗑️</Text></TouchableOpacity>
          <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn}>
            <Text style={styles.arrowIcon}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.divider} />
          
          <View style={styles.prioritySection}>
            <Text style={styles.detailLabel}>Độ ưu tiên:</Text>
            <View style={[
              styles.priorityBadge, 
              { backgroundColor: priority === 'Cao' ? '#fee2e2' : '#f3f4f6' }
            ]}>
              <Text style={[styles.priorityText, { color: priority === 'Cao' ? '#ef4444' : '#6b7280' }]}>
                {priority}
              </Text>
            </View>
          </View>

          <Text style={styles.detailLabel}>Chỉ số dinh dưỡng chi tiết:</Text>
          <View style={styles.nutrientList}>
            {nutrients.map((item, index) => (
              <View key={index} style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>{item.label}: {item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  infoContainer: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  goalDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, marginLeft: 4 },
  expandBtn: { marginLeft: 8, backgroundColor: '#f9fafb', padding: 8, borderRadius: 8 },
  arrowIcon: { fontSize: 10, color: '#9ca3af' },
  detailsContainer: { paddingBottom: 16 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  prioritySection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  priorityBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 12, fontWeight: 'bold' },
  nutrientList: { gap: 6 },
  nutrientItem: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 10 },
  nutrientLabel: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
});

export default HealthGoalCard;