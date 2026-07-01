import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing, Shadow } from '../constants/tokens';
import { Recipe, MealType } from '../types';
import { mealAlternatives } from '../data/weekMenu';

interface Props {
  visible: boolean;
  mealType: MealType;
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function ChangeMealModal({ visible, mealType, onSelect, onClose }: Props) {
  const alternatives = mealAlternatives[mealType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>¿Qué te apetece más?</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {alternatives.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.option}
              onPress={() => onSelect(recipe)}
              activeOpacity={0.75}
            >
              <View style={styles.optionImagePlaceholder}>
                <Feather name="coffee" size={22} color={Colors.piedra} opacity={0.5} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionName} numberOfLines={2}>{recipe.name}</Text>
                <View style={styles.optionMeta}>
                  <Feather name="clock" size={12} color={Colors.greige} />
                  <Text style={styles.optionMetaText}>{recipe.time} min</Text>
                  <Text style={styles.optionSep}> · </Text>
                  <Text style={styles.optionMetaText}>{recipe.difficulty}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.greige} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(38,38,38,0.4)',
  },
  sheet: {
    backgroundColor: Colors.blanco,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.greige,
    alignSelf: 'center',
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  title: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 20,
    color: Colors.carbon,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(183,173,162,0.2)',
    gap: Spacing.md,
  },
  optionImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    backgroundColor: Colors.salvia,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontFamily: FontFamily.interMedium,
    fontSize: 15,
    color: Colors.carbon,
    marginBottom: 4,
  },
  optionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionMetaText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    color: Colors.piedra,
    marginLeft: 3,
  },
  optionSep: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    color: Colors.greige,
  },
  cancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 15,
    color: Colors.piedra,
  },
});
