import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing } from '../constants/tokens';

type Status = 'red' | 'orange' | 'green';

interface Ingredient {
  id: string;
  name: string;
  status: Status;
}

const MOCK_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Espinacas', status: 'red' },
  { id: '2', name: 'Yogur natural', status: 'orange' },
  { id: '3', name: 'Zanahorias', status: 'green' },
  { id: '4', name: 'Medio limón', status: 'orange' },
];

const STATUS_COLOR: Record<Status, string> = {
  red: '#E24B4A',
  orange: '#EF9F27',
  green: '#639922',
};

function StatusDot({ status }: { status: Status }) {
  return <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />;
}

function IngredientRow({
  item,
  onRemove,
  isLast,
}: {
  item: Ingredient;
  onRemove: (id: string) => void;
  isLast: boolean;
}) {
  return (
    <View style={[styles.ingredientRow, !isLast && styles.ingredientRowDivider]}>
      <StatusDot status={item.status} />
      <Text style={styles.ingredientName}>{item.name}</Text>
      <View style={styles.ingredientActions}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.6}>
          <Feather name="check" size={16} color={Colors.greige} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Feather name="x" size={16} color={Colors.greige} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NeveraScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'initial' | 'result'>('initial');
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS);

  const removeIngredient = (id: string) =>
    setIngredients(prev => prev.filter(i => i.id !== id));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {phase === 'initial' ? (
        /* ════ ESTAT 1: inicial ════ */
        <View style={styles.initialRoot}>
          <Text style={styles.mainTitle}>Hospital de la Nevera</Text>
          <Text style={styles.subtitle}>
            Hazle una foto a tu nevera y te digo qué rescatar
          </Text>

          <View style={styles.viewfinder}>
            <MaterialCommunityIcons name="fridge-outline" size={64} color={Colors.greige} />
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => setPhase('result')}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={16} color={Colors.blanco} />
            <Text style={styles.ctaBtnText}>Hacer foto</Text>
          </TouchableOpacity>
        </View>

      ) : (
        /* ════ ESTAT 2: resultat ════ */
        <View style={styles.resultRoot}>
          <ScrollView
            style={styles.resultScroll}
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.mainTitle}>Esto es lo que he visto</Text>

            <View style={styles.ingredientCard}>
              {ingredients.map((item, i) => (
                <IngredientRow
                  key={item.id}
                  item={item}
                  onRemove={removeIngredient}
                  isLast={i === ingredients.length - 1}
                />
              ))}

              <TouchableOpacity style={styles.addRow} activeOpacity={0.7}>
                <Feather name="plus" size={14} color={Colors.greige} />
                <Text style={styles.addRowText}>Añadir algo más</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* CTA ancorat a baix */}
          <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => {}} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>Buscar receta</Text>
              <Feather name="arrow-right" size={16} color={Colors.blanco} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Toggle dev */}
      <TouchableOpacity
        style={[styles.devToggle, { top: insets.top + 8 }]}
        onPress={() => setPhase(p => (p === 'initial' ? 'result' : 'initial'))}
        activeOpacity={0.7}
      >
        <Text style={styles.devToggleText}>
          {phase === 'initial' ? 'Ver resultado →' : '← Ver cámara'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ─── Arrel ─── */
  root: {
    flex: 1,
    backgroundColor: Colors.crema,
  },

  /* ─── Estat inicial ─── */
  initialRoot: {
    flex: 1,
    backgroundColor: Colors.crema,
    alignItems: 'center',
    justifyContent: 'center',  // centrat vertical real
    paddingHorizontal: Spacing.lg,
  },
  mainTitle: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 26,
    color: Colors.carbon,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.piedra,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  viewfinder: {
    width: 200,
    height: 260,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.greige,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(183,173,162,0.06)',
  },

  /* ─── Estat resultat ─── */
  resultRoot: {
    flex: 1,
    backgroundColor: Colors.crema,
  },
  resultScroll: {
    flex: 1,
    backgroundColor: Colors.crema,
  },
  resultScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  ingredientCard: {
    backgroundColor: Colors.blanco,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(183,173,162,0.22)',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.blanco,
  },
  ingredientRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(183,173,162,0.2)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ingredientName: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
  },
  ingredientActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopStyle: 'dashed',
    borderTopColor: 'rgba(183,173,162,0.35)',
  },
  addRowText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.greige,
  },

  /* ─── CTA bar (ancorat) ─── */
  ctaBar: {
    backgroundColor: Colors.crema,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },

  /* ─── Botó CTA (compartit) ─── */
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.coral,
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
  },
  ctaBtnText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.blanco,
  },

  /* ─── Toggle dev ─── */
  devToggle: {
    position: 'absolute',
    right: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(38,38,38,0.08)',
    borderRadius: Radius.sm,
  },
  devToggleText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 11,
    color: Colors.piedra,
  },
});
