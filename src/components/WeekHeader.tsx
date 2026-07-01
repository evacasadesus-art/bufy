import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing } from '../constants/tokens';

interface Props {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function WeekHeader({ weekLabel, onPrev, onNext }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú</Text>
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={onPrev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}>
          <Feather name="chevron-left" size={20} color={Colors.greige} />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <TouchableOpacity onPress={onNext} hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}>
          <Feather name="chevron-right" size={20} color={Colors.greige} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.crema,
  },
  title: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 28,
    color: Colors.carbon,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weekLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.piedra,
  },
});
