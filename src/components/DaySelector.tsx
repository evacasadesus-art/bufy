import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontFamily, Radius, Spacing } from '../constants/tokens';
import { DayKey } from '../types';

const DAYS: DayKey[] = ['L', 'M', 'X', 'J', 'V'];

interface Props {
  selectedIndex: number;
  todayIndex: number | null;
  fullDayLabel: string;
  onSelect: (index: number) => void;
}

export default function DaySelector({ selectedIndex, todayIndex, fullDayLabel, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {DAYS.map((day, i) => {
          const isSelected = i === selectedIndex;
          const isToday = i === todayIndex;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onSelect(i)}
              style={[styles.dayBtn, isSelected && styles.dayBtnSelected]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                {day}
              </Text>
              {isToday && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.fullLabel}>{fullDayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.crema,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dayBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnSelected: {
    backgroundColor: Colors.coral,
  },
  dayText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.piedra,
  },
  dayTextSelected: {
    color: Colors.blanco,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.coral,
  },
  dotSelected: {
    backgroundColor: Colors.blanco,
  },
  fullLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.piedra,
    textAlign: 'center',
  },
});
