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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontFamily, Radius, Spacing, Shadow } from '../constants/tokens';

interface LoyaltyCard {
  id: string;
  name: string;
  uri: string;
}

export default function MonederoScreen() {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [expandedUri, setExpandedUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPendingUri(result.assets[0].uri);
    }
  };

  const openAdd = () => {
    setCardName('');
    setPendingUri(null);
    setShowAddModal(true);
  };

  const saveCard = () => {
    if (!cardName.trim() || !pendingUri) return;
    setCards(prev => [
      ...prev,
      { id: Date.now().toString(), name: cardName.trim(), uri: pendingUri! },
    ]);
    setShowAddModal(false);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const canSave = cardName.trim().length > 0 && !!pendingUri;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {cards.length === 0 ? (
        /* ——— Estado vacío ——— */
        <View style={styles.emptyRoot}>
          <Text style={styles.header}>Tu monedero</Text>
          <View style={styles.emptyCenter}>
            <View style={styles.emptyIconWrap}>
              <Feather name="credit-card" size={60} color={Colors.greige} />
            </View>
            <Text style={styles.emptyText}>
              Añade tus tarjetas de fidelización para tenerlas siempre a mano en la cola del súper.
            </Text>
            <TouchableOpacity style={styles.addBtnPrimary} onPress={openAdd} activeOpacity={0.8}>
              <Feather name="plus" size={16} color={Colors.blanco} />
              <Text style={styles.addBtnPrimaryText}>Añadir tarjeta</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* ——— Lista de tarjetas ——— */
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.header}>Tu monedero</Text>
            {cards.map(card => (
              <View key={card.id} style={styles.cardBlock}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeCard(card.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color={Colors.greige} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setExpandedUri(card.uri)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: card.uri }}
                    style={styles.barcodeImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.tapHint}>Toca para ampliar · enséñala en caja</Text>
              </View>
            ))}
            <View style={{ height: 96 }} />
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            style={[styles.fab, { bottom: insets.bottom + 76 }]}
            onPress={openAdd}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={Colors.blanco} />
            <Text style={styles.fabText}>Añadir tarjeta</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ——— Modal: añadir tarjeta ——— */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nueva tarjeta</Text>

            <TextInput
              style={styles.nameInput}
              value={cardName}
              onChangeText={setCardName}
              placeholder="Ej: Lidl Plus, Bonpreu, Carrefour..."
              placeholderTextColor={Colors.greige}
              autoFocus
            />

            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Feather name="image" size={15} color={Colors.piedra} />
              <Text style={styles.pickImageText}>
                {pendingUri ? 'Cambiar imagen' : 'Seleccionar foto del código de barras'}
              </Text>
            </TouchableOpacity>

            {pendingUri && (
              <Image
                source={{ uri: pendingUri }}
                style={styles.preview}
                resizeMode="contain"
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                onPress={saveCard}
                activeOpacity={0.8}
                disabled={!canSave}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ——— Modal: imagen a pantalla completa ——— */}
      <Modal
        visible={!!expandedUri}
        transparent
        animationType="fade"
        onRequestClose={() => setExpandedUri(null)}
      >
        <Pressable style={styles.fullscreenBackdrop} onPress={() => setExpandedUri(null)}>
          {expandedUri && (
            <Image
              source={{ uri: expandedUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setExpandedUri(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.crema,
  },
  header: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 28,
    color: Colors.carbon,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  /* Empty state */
  emptyRoot: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(183,173,162,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.piedra,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  addBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.coral,
    borderRadius: Radius.full,
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl,
  },
  addBtnPrimaryText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 15,
    color: Colors.blanco,
  },

  /* Cards list */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  cardBlock: {
    backgroundColor: Colors.blanco,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardName: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 16,
    color: Colors.carbon,
  },
  barcodeImage: {
    width: '100%',
    height: 120,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(183,173,162,0.08)',
  },
  tapHint: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    color: Colors.greige,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.coral,
    borderRadius: Radius.full,
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    ...Shadow,
  },
  fabText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
    color: Colors.blanco,
  },

  /* Add modal */
  backdrop: {
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
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.greige,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    color: Colors.carbon,
    marginBottom: Spacing.md,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.greige,
    marginBottom: Spacing.md,
  },
  pickImageText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.piedra,
  },
  preview: {
    width: '100%',
    height: 100,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(183,173,162,0.08)',
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.greige,
  },
  cancelBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.piedra,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.coral,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.greige,
  },
  saveBtnText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
    color: Colors.blanco,
  },

  /* Fullscreen modal */
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
});
