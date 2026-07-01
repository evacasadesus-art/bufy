import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius } from '../constants/tokens';

interface Props {
  large?: boolean;
  style?: object;
}

export default function MealImage({ large = false, style }: Props) {
  return (
    <View style={[styles.container, large && styles.large, style]}>
      <Feather name="coffee" size={large ? 52 : 36} color={Colors.piedra} opacity={0.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.salvia,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    height: 260,
    borderRadius: 0,
  },
});
