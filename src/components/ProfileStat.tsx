// src/components/ProfileStat.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileStatProps {
  value: number;
  label: string;
}

const ProfileStat: React.FC<ProfileStatProps> = ({ value, label }) => {
  return (
    <View style={styles.statContainer}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
});

export default ProfileStat;