import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing } from '../constants/tokens';
import { Recipe } from '../types';
import MealImage from '../components/MealImage';

function showAudioToast() {
  const msg = 'Cocina sin tocar la pantalla — próximamente';
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('Modo Audio-Chef', msg);
  }
}

export default function RecipeDetailScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recipe = JSON.parse(data) as Recipe;

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="arrow-left" size={22} color={Colors.carbon} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces style={styles.scroll}>
        <MealImage large />

        <View style={styles.content}>
          <Text style={styles.name}>{recipe.name}</Text>

          <View style={styles.meta}>
            <Feather name="clock" size={14} color={Colors.greige} />
            <Text style={styles.metaText}>{recipe.time} min</Text>
            <Text style={styles.sep}> · </Text>
            <Feather name="users" size={14} color={Colors.greige} />
            <Text style={styles.metaText}>{recipe.persons} pers</Text>
            <Text style={styles.sep}> · </Text>
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientBullet}>·</Text>
              <Text style={styles.ingredientText}>{ing}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Preparación</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.audioBtn} onPress={showAudioToast} activeOpacity={0.7}>
            <Feather name="volume-2" size={16} color={Colors.carbon} />
            <Text style={styles.audioBtnText}>Modo Audio-Chef</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.crema,
  },
  scroll: {
    backgroundColor: Colors.crema,
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: Colors.blanco,
    borderRadius: 20,
    padding: 8,
    shadowColor: Colors.greige,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  name: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 26,
    color: Colors.carbon,
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  metaText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.piedra,
    marginLeft: 4,
  },
  sep: {
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.greige,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(183,173,162,0.25)',
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 11,
    color: Colors.piedra,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: Spacing.sm,
  },
  ingredientBullet: {
    fontFamily: FontFamily.interRegular,
    fontSize: 16,
    color: Colors.oliva,
    lineHeight: 22,
  },
  ingredientText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
    lineHeight: 22,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  stepNumber: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.coral,
    lineHeight: 22,
    width: 20,
  },
  stepText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
    lineHeight: 24,
    flex: 1,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.greige,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  audioBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.carbon,
  },
});
