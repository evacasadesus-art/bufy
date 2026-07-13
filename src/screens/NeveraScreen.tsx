import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Colors, FontFamily, Radius, Spacing } from '../constants/tokens';

type Status = 'red' | 'orange' | 'green';
type Phase = 'initial' | 'loading' | 'result' | 'notice' | 'recipeLoading' | 'recipe';
type NoticeContext = 'camera' | 'recipe';

interface Ingredient {
  id: string;
  name: string;
  status: Status;
}

interface RawIngredient {
  nombre: string;
  urgencia: Status | 'aviso';
}

interface Recipe {
  nombre: string;
  tiempo: string;
  necesitas: string[];
  pasos: string[];
}

const ANALYZE_URL = 'https://bufy.vercel.app/api/analyze-fridge';
const GENERATE_RECIPE_URL = 'https://bufy.vercel.app/api/generate-recipe';
const MAX_IMAGE_WIDTH = 1024;
const IMAGE_QUALITY = 0.7;
const GENERIC_ERROR_MESSAGE = 'Vaya, algo ha fallado por aquí. ¿Probamos otra vez?';
const PERMISSION_ERROR_MESSAGE =
  'Necesito acceso a la cámara para poder ayudarte. Puedes activarlo en los ajustes del móvil.';

const STATUS_COLOR: Record<Status, string> = {
  red: '#E24B4A',
  orange: '#EF9F27',
  green: '#639922',
};

async function compressImage(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_IMAGE_WIDTH });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: IMAGE_QUALITY,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('No se pudo comprimir la imagen.');
  }

  return result.base64;
}

async function analyzeFridge(base64Image: string): Promise<RawIngredient[]> {
  const response = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mediaType: 'image/jpeg' }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.error) {
    throw new Error(data?.error ?? 'analyze_failed');
  }

  if (!Array.isArray(data.ingredients)) {
    throw new Error('unexpected_shape');
  }

  return data.ingredients;
}

async function generateRecipe(ingredients: Ingredient[]): Promise<Recipe> {
  const response = await fetch(GENERATE_RECIPE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredients: ingredients.map(item => ({ nombre: item.name, urgencia: item.status })),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.error) {
    throw new Error(data?.error ?? 'generate_recipe_failed');
  }

  if (!data.recipe || typeof data.recipe.nombre !== 'string') {
    throw new Error('unexpected_shape');
  }

  return data.recipe;
}

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
  const [phase, setPhase] = useState<Phase>('initial');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeContext, setNoticeContext] = useState<NoticeContext>('camera');
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const removeIngredient = (id: string) =>
    setIngredients(prev => prev.filter(i => i.id !== id));

  const showNotice = (message: string, context: NoticeContext = 'camera') => {
    setNoticeMessage(message);
    setNoticeContext(context);
    setPhase('notice');
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showNotice(PERMISSION_ERROR_MESSAGE);
        return;
      }

      const capture = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (capture.canceled || !capture.assets?.length) return;

      setPhase('loading');

      const base64Image = await compressImage(capture.assets[0].uri);
      const raw = await analyzeFridge(base64Image);

      if (raw.length === 1 && raw[0].urgencia === 'aviso') {
        showNotice(raw[0].nombre);
        return;
      }

      const parsed: Ingredient[] = raw
        .filter((item): item is RawIngredient & { urgencia: Status } => item.urgencia !== 'aviso')
        .map((item, index) => ({
          id: `${Date.now()}-${index}`,
          name: item.nombre,
          status: item.urgencia,
        }));

      setIngredients(parsed);
      setPhase('result');
    } catch {
      showNotice(GENERIC_ERROR_MESSAGE);
    }
  };

  const handleSearchRecipe = async () => {
    try {
      setPhase('recipeLoading');
      const generated = await generateRecipe(ingredients);
      setRecipe(generated);
      setPhase('recipe');
    } catch {
      showNotice(GENERIC_ERROR_MESSAGE, 'recipe');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {phase === 'initial' && (
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
            onPress={handleTakePhoto}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={16} color={Colors.blanco} />
            <Text style={styles.ctaBtnText}>Hacer foto</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'loading' && (
        /* ════ ESTAT: carregant ════ */
        <View style={styles.initialRoot}>
          <ActivityIndicator size="small" color={Colors.piedra} />
          <Text style={[styles.subtitle, styles.loadingText]}>Mirando qué tienes...</Text>
        </View>
      )}

      {phase === 'notice' && (
        /* ════ ESTAT: avís (foto dolenta o error) ════ */
        <View style={styles.initialRoot}>
          <Text style={styles.subtitle}>{noticeMessage}</Text>

          {noticeContext === 'camera' ? (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleTakePhoto}
              activeOpacity={0.85}
            >
              <Feather name="camera" size={16} color={Colors.blanco} />
              <Text style={styles.ctaBtnText}>Hacer otra foto</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleSearchRecipe}
              activeOpacity={0.85}
            >
              <Feather name="refresh-cw" size={16} color={Colors.blanco} />
              <Text style={styles.ctaBtnText}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {phase === 'recipeLoading' && (
        /* ════ ESTAT: generant recepta ════ */
        <View style={styles.initialRoot}>
          <ActivityIndicator size="small" color={Colors.piedra} />
          <Text style={[styles.subtitle, styles.loadingText]}>Pensando qué cocinar...</Text>
        </View>
      )}

      {phase === 'result' && (
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
            <TouchableOpacity style={styles.ctaBtn} onPress={handleSearchRecipe} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>Buscar receta</Text>
              <Feather name="arrow-right" size={16} color={Colors.blanco} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {phase === 'recipe' && recipe && (
        /* ════ ESTAT 3: recepta comodín ════ */
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setPhase('result')}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={16} color={Colors.piedra} />
            <Text style={styles.backLinkText}>Ingredientes</Text>
          </TouchableOpacity>

          <Text style={styles.recipeName}>{recipe.nombre}</Text>

          <View style={styles.timeCapsule}>
            <Text style={styles.timeCapsuleText}>{recipe.tiempo}</Text>
          </View>

          <View style={styles.needsCard}>
            <Text style={styles.needsTitle}>Necesitas</Text>
            {recipe.necesitas.map((item, i) => (
              <View key={i} style={styles.needsRow}>
                <Text style={styles.needsBullet}>·</Text>
                <Text style={styles.needsText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.stepsBlock}>
            {recipe.pasos.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  loadingText: {
    marginTop: Spacing.md,
    marginBottom: 0,
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
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
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

  /* ─── Estat recepta comodín ─── */
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backLinkText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.piedra,
  },
  recipeName: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 28,
    color: Colors.carbon,
    lineHeight: 36,
    marginBottom: Spacing.md,
  },
  timeCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.coral,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: Spacing.xl,
  },
  timeCapsuleText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 13,
    color: Colors.blanco,
  },
  needsCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  needsTitle: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 11,
    color: Colors.piedra,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  needsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 8,
  },
  needsBullet: {
    fontFamily: FontFamily.interRegular,
    fontSize: 16,
    color: Colors.greige,
    lineHeight: 22,
  },
  needsText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
    lineHeight: 22,
    flex: 1,
  },
  stepsBlock: {
    marginBottom: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepNumber: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.greige,
    lineHeight: 24,
    width: 22,
  },
  stepText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.carbon,
    lineHeight: 24,
    flex: 1,
  },
});
