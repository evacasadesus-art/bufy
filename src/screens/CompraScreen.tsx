import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing, Shadow } from '../constants/tokens';

const DESPENSA: { group: string; items: string[] }[] = [
  {
    group: 'Conservas',
    items: ['Tomate triturado', 'Garbanzos cocidos', 'Lentejas cocidas', 'Atún en aceite', 'Maíz dulce'],
  },
  {
    group: 'Congelados',
    items: ['Guisantes', 'Espinacas', 'Croquetas de bacalao'],
  },
  {
    group: 'Básicos',
    items: ['Aceite de oliva virgen extra', 'Pasta spaghetti', 'Arroz redondo', 'Sal y especias', 'Vinagre de vino'],
  },
];

const FRESCOS = [
  'Pollo (muslos)',
  'Salmón fresco',
  'Patatas',
  'Tomates',
  'Lechuga romana',
  'Cebolla',
  'Ajo',
  'Limones',
  'Pimientos rojos',
  'Champiñones',
  'Huevos (docena)',
];

const SUPERS = [
  { name: 'Mercadona', url: 'https://www.mercadona.es' },
  { name: 'Bonpreu', url: 'https://www.bonpreuesclat.cat' },
  { name: 'Carrefour', url: 'https://www.carrefour.es' },
  { name: 'Consum', url: 'https://www.consum.es' },
  { name: 'El Corte Inglés', url: 'https://www.elcorteingles.es/supermercado/' },
];

interface ExtraItem {
  id: string;
  text: string;
  checked: boolean;
}

function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('', msg);
  }
}

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.checkbox, checked && styles.checkboxChecked]}
      onPress={onToggle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {checked && <Feather name="check" size={13} color={Colors.blanco} />}
    </TouchableOpacity>
  );
}

function CheckItem({
  label,
  checked,
  onToggle,
  onRemove,
  isLast,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.checkRow, !isLast && styles.checkRowDivider]}>
      <Checkbox checked={checked} onToggle={onToggle} />
      <Text style={[styles.checkLabel, checked && styles.checkLabelDone]}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Feather name="x" size={14} color={Colors.greige} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function CompraScreen() {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [extraInput, setExtraInput] = useState('');

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const addExtra = () => {
    const val = extraInput.trim();
    if (!val) return;
    setExtras(prev => [...prev, { id: Date.now().toString(), text: val, checked: false }]);
    setExtraInput('');
  };

  const toggleExtra = (id: string) => {
    setExtras(prev => prev.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  const removeExtra = (id: string) => {
    setExtras(prev => prev.filter(e => e.id !== id));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Tu compra</Text>

        {/* Sección 1: Despensa del mes */}
        <SectionCard>
          <SectionTitle>Despensa del mes</SectionTitle>
          {DESPENSA.map((group, gi) => (
            <View key={group.group}>
              <Text style={styles.groupLabel}>{group.group}</Text>
              {group.items.map((item, ii) => {
                const key = `d:${group.group}:${item}`;
                const isLast = ii === group.items.length - 1;
                return (
                  <CheckItem
                    key={key}
                    label={item}
                    checked={checked.has(key)}
                    onToggle={() => toggle(key)}
                    isLast={isLast}
                  />
                );
              })}
              {gi < DESPENSA.length - 1 && <View style={styles.groupDivider} />}
            </View>
          ))}
        </SectionCard>

        {/* Sección 2: Frescos de la semana */}
        <SectionCard>
          <SectionTitle>Frescos de la semana</SectionTitle>
          {FRESCOS.map((item, i) => {
            const key = `f:${item}`;
            return (
              <CheckItem
                key={key}
                label={item}
                checked={checked.has(key)}
                onToggle={() => toggle(key)}
                isLast={i === FRESCOS.length - 1}
              />
            );
          })}
        </SectionCard>

        {/* Sección 3: Extras del hogar */}
        <SectionCard>
          <SectionTitle>Extras</SectionTitle>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={extraInput}
              onChangeText={setExtraInput}
              placeholder="Añadir producto del hogar..."
              placeholderTextColor={Colors.greige}
              onSubmitEditing={addExtra}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addExtra} activeOpacity={0.7}>
              <Feather name="plus" size={18} color={Colors.blanco} />
            </TouchableOpacity>
          </View>
          {extras.map((item, i) => (
            <CheckItem
              key={item.id}
              label={item.text}
              checked={item.checked}
              onToggle={() => toggleExtra(item.id)}
              onRemove={() => removeExtra(item.id)}
              isLast={i === extras.length - 1}
            />
          ))}
        </SectionCard>

        {/* Sección 4: Enviar la lista */}
        <SectionCard>
          <SectionTitle>Enviar la lista</SectionTitle>

          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={() => showToast('Descarga en PDF — próximamente')}
            activeOpacity={0.7}
          >
            <Feather name="download" size={16} color={Colors.piedra} />
            <Text style={styles.pdfBtnText}>Descargar en PDF</Text>
          </TouchableOpacity>

          <Text style={styles.superLabel}>O haz la compra online en tu súper favorito</Text>

          <View style={styles.supersRow}>
            {SUPERS.map(s => (
              <TouchableOpacity
                key={s.name}
                style={styles.superBtn}
                onPress={() => Linking.openURL(s.url)}
                activeOpacity={0.7}
              >
                <Text style={styles.superBtnText}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

  groupLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 11,
    color: Colors.piedra,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  groupDivider: {
    height: 1,
    backgroundColor: 'rgba(183,173,162,0.2)',
    marginVertical: Spacing.md,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  checkRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(183,173,162,0.15)',
  },
  checkLabel: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
  },
  checkLabelDone: {
    color: Colors.greige,
    textDecorationLine: 'line-through',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.greige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },

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

  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.greige,
    marginBottom: Spacing.lg,
  },
  pdfBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.piedra,
  },
  superLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: Colors.piedra,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  supersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  superBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.blanco,
    borderWidth: 1,
    borderColor: Colors.greige,
  },
  superBtnText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 13,
    color: Colors.carbon,
  },
});
