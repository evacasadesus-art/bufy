import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing, Shadow } from '../constants/tokens';
import { Recipe, MealType } from '../types';
import MealImage from './MealImage';

interface Props {
  mealType: MealType;
  recipe: Recipe;
  onPress: () => void;
  onChangePress: () => void;
}

const LABEL: Record<MealType, string> = {
  comida: 'COMIDA',
  cena: 'CENA',
};

export default function MealCard({ mealType, recipe, onPress, onChangePress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <Text style={styles.label}>{LABEL[mealType]}</Text>
      <Text style={styles.name} numberOfLines={2}>{recipe.name}</Text>

      <View style={styles.meta}>
        <Feather name="clock" size={13} color={Colors.greige} />
        <Text style={styles.metaText}>{recipe.time} min</Text>
        <Text style={styles.separator}> · </Text>
        <Feather name="users" size={13} color={Colors.greige} />
        <Text style={styles.metaText}>{recipe.persons} pers</Text>
        <Text style={styles.separator}> · </Text>
        <Text style={styles.metaText}>{recipe.difficulty}</Text>
      </View>

      <MealImage style={styles.image} />

      <TouchableOpacity onPress={onChangePress} style={styles.changeBtn} activeOpacity={0.6}>
        <Feather name="refresh-cw" size={14} color={Colors.coral} />
        <Text style={styles.changeBtnText}>Cambiar plato</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.blanco,
    borderRadius: Radius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(183,173,162,0.25)',
    marginBottom: Spacing.md,
    ...Shadow,
  },
  label: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 11,
    color: Colors.piedra,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  name: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 24,
    color: Colors.carbon,
    lineHeight: 30,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.piedra,
    marginLeft: 4,
  },
  separator: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.greige,
  },
  image: {
    marginBottom: Spacing.md,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
  },
  changeBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.coral,
  },
});
