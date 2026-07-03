import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing, Shadow } from '../constants/tokens';

type CookingMethod = 'bufy' | 'tradicional';
type DietStyle = 'omnivoro' | 'vegetariano' | 'vegano';
type Goal = 'mediterranea' | 'proteina' | 'hidratos';

const MAIN_ALLERGIES = ['Gluten', 'Lactosa', 'Frutos secos', 'Marisco', 'Huevo', 'Soja'];
const MORE_ALLERGIES = ['Melocotón', 'Fresas', 'Kiwi', 'Apio', 'Sésamo', 'Mostaza', 'Moluscos', 'Altramuz', 'Sulfitos'];

const DIET_OPTIONS: { key: DietStyle; label: string }[] = [
  { key: 'omnivoro', label: 'Omnívoro' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'vegano', label: 'Vegano' },
];

const GOAL_OPTIONS: { key: Goal; label: string }[] = [
  { key: 'mediterranea', label: 'Dieta mediterránea equilibrada' },
  { key: 'proteina', label: 'Más proteína (gimnasio)' },
  { key: 'hidratos', label: 'Reducir hidratos' },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.radioRow, i < options.length - 1 && styles.radioRowDivider]}
          onPress={() => onChange(opt.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, value === opt.key && styles.radioCircleActive]}>
            {value === opt.key && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.radioLabel, value === opt.key && styles.radioLabelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [cookingMethod, setCookingMethod] = useState<CookingMethod>('bufy');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [diet, setDiet] = useState<DietStyle>('omnivoro');
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [goal, setGoal] = useState<Goal>('mediterranea');

  const toggleAllergy = (item: string) => {
    setAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addBlacklistItem = () => {
    const val = inputValue.trim();
    if (val && !blacklist.includes(val.toLowerCase())) {
      setBlacklist(prev => [...prev, val]);
      setInputValue('');
    }
  };

  const removeBlacklistItem = (item: string) => {
    setBlacklist(prev => prev.filter(b => b !== item));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Tu perfil</Text>

        {/* Sección 1: Método de cocina */}
        <SectionCard>
          <SectionTitle>¿Cómo te gusta cocinar?</SectionTitle>

          <TouchableOpacity
            style={[styles.methodCard, cookingMethod === 'bufy' && styles.methodCardActive]}
            onPress={() => setCookingMethod('bufy')}
            activeOpacity={0.8}
          >
            <Text style={styles.methodEmoji}>🟠</Text>
            <View style={styles.methodContent}>
              <Text style={[styles.methodName, cookingMethod === 'bufy' && styles.methodNameActive]}>
                Método bufy
              </Text>
              <Text style={styles.methodDesc}>
                Usamos productos pre-preparados de calidad para que cocines en la mitad de tiempo. Cebolla pochada de bote, legumbres de conserva, verduras congeladas. Igual de sano, el doble de rápido.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, styles.methodCardLast, cookingMethod === 'tradicional' && styles.methodCardActive]}
            onPress={() => setCookingMethod('tradicional')}
            activeOpacity={0.8}
          >
            <Text style={styles.methodEmoji}>🟢</Text>
            <View style={styles.methodContent}>
              <Text style={[styles.methodName, cookingMethod === 'tradicional' && styles.methodNameActive]}>
                Cocina tradicional
              </Text>
              <Text style={styles.methodDesc}>
                Todo desde cero. Más tiempo en la cocina, el mismo resultado.
              </Text>
            </View>
          </TouchableOpacity>
        </SectionCard>

        {/* Sección 2: Alergias */}
        <SectionCard>
          <SectionTitle>Alergias e intolerancias</SectionTitle>
          <View style={styles.chipsWrap}>
            {MAIN_ALLERGIES.map(item => {
              const active = allergies.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleAllergy(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
            {MORE_ALLERGIES.filter(item => allergies.includes(item)).map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, styles.chipActive]}
                onPress={() => toggleAllergy(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setShowMoreModal(true)}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={13} color={Colors.coral} />
              <Text style={styles.moreBtnText}>Más</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Modal alérgenos adicionales */}
        <Modal
          visible={showMoreModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMoreModal(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowMoreModal(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Más alérgenos</Text>
              <View style={styles.chipsWrap}>
                {MORE_ALLERGIES.map(item => {
                  const active = allergies.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleAllergy(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setShowMoreModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneBtnText}>Listo</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Sección 3: Estilo de dieta */}
        <SectionCard>
          <SectionTitle>Estilo de dieta</SectionTitle>
          <RadioGroup options={DIET_OPTIONS} value={diet} onChange={setDiet} />
        </SectionCard>

        {/* Sección 4: Lista negra */}
        <SectionCard>
          <SectionTitle>Tu lista negra</SectionTitle>
          <Text style={styles.subtitle}>Ingredientes que odias</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Añadir ingrediente..."
              placeholderTextColor={Colors.greige}
              onSubmitEditing={addBlacklistItem}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addBlacklistItem} activeOpacity={0.7}>
              <Feather name="plus" size={18} color={Colors.blanco} />
            </TouchableOpacity>
          </View>
          {blacklist.length > 0 && (
            <View style={styles.chipsWrap}>
              {blacklist.map(item => (
                <View key={item} style={styles.blacklistChip}>
                  <Text style={styles.blacklistChipText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => removeBlacklistItem(item)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="x" size={12} color={Colors.piedra} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        {/* Sección 5: Objetivo */}
        <SectionCard>
          <SectionTitle>Tu objetivo</SectionTitle>
          <RadioGroup options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
        </SectionCard>
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
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 28,
    color: Colors.carbon,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.blanco,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow,
  },
  sectionTitle: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 17,
    color: Colors.carbon,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: FontFamily.interMedium,
    fontSize: 13,
    color: Colors.piedra,
    marginBottom: Spacing.sm,
  },

  // Method cards
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.greige,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  methodCardLast: {
    marginBottom: 0,
  },
  methodCardActive: {
    borderColor: Colors.coral,
    backgroundColor: 'rgba(240,106,75,0.04)',
  },
  methodEmoji: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 1,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.carbon,
    marginBottom: 4,
  },
  methodNameActive: {
    color: Colors.coral,
  },
  methodDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.piedra,
    lineHeight: 19,
  },

  // Allergy chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.greige,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  chipText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 13,
    color: Colors.piedra,
  },
  chipTextActive: {
    color: Colors.blanco,
  },

  // Radio
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: Spacing.md,
  },
  radioRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(183,173,162,0.2)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.greige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.coral,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.coral,
  },
  radioLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
    flex: 1,
  },
  radioLabelActive: {
    fontFamily: FontFamily.interMedium,
    color: Colors.coral,
  },

  // Blacklist
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.greige,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.carbon,
    backgroundColor: Colors.blanco,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blacklistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.greige,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.blanco,
  },
  blacklistChipText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.carbon,
  },

  // Más button
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  moreBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 13,
    color: Colors.coral,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(38,38,38,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.blanco,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 480,
    ...Shadow,
  },
  modalTitle: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 20,
    color: Colors.carbon,
    marginBottom: Spacing.md,
  },
  modalDoneBtn: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.coral,
    borderRadius: Radius.full,
  },
  modalDoneBtnText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
    color: Colors.blanco,
  },
});
