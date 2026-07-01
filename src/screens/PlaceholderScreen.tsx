import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '../constants/tokens';

interface Props {
  label: string;
}

export default function PlaceholderScreen({ label }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.text}>Próximamente</Text>
      <Text style={styles.sub}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.crema,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 24,
    color: Colors.carbon,
    marginBottom: 8,
  },
  sub: {
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.piedra,
  },
});
