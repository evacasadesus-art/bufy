import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Colors } from '../src/constants/tokens';
import SplashOverlay from '../src/components/SplashOverlay';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Crema blank while fonts load — keeps colour consistent with splash
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.crema }} />;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.crema} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipe-detail"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
      </Stack>
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
    </>
  );
}
