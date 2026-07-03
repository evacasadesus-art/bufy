import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Colors, FontFamily } from '../constants/tokens';

interface Props {
  onDone: () => void;
}

export default function SplashOverlay({ onDone }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onDone());
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <Text style={styles.wordmark}>bufy</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.crema,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  wordmark: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 44,
    color: Colors.carbon,
  },
});
