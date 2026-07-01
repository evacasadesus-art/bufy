import React, { useState, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Radius, Spacing } from '../constants/tokens';
import { weekMenu } from '../data/weekMenu';
import { MealType, Recipe, WeekMenu } from '../types';
import WeekHeader from '../components/WeekHeader';
import DaySelector from '../components/DaySelector';
import MealCard from '../components/MealCard';
import ChangeMealModal from '../components/ChangeMealModal';

const DAY_NAMES_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const SHORT_MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function getTodayDayIndex(): number | null {
  const d = new Date().getDay();
  if (d === 0 || d === 6) return null;
  return d - 1;
}

function getWeekMonday(offsetWeeks: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff + offsetWeeks * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatWeekLabel(monday: Date): string {
  const d = monday.getDate();
  const m = SHORT_MONTHS[monday.getMonth()];
  return `Semana del ${d} ${m}`;
}

function getDayDateLabel(dayIndex: number, monday: Date): string {
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayIndex);
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  return `${DAY_NAMES_FULL[dayIndex]} ${d} de ${m}`;
}

function showAudioToast() {
  const msg = 'Cocina sin tocar la pantalla — próximamente';
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('Modo Audio-Chef', msg);
  }
}

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const todayIndex = getTodayDayIndex();
  const [selectedDay, setSelectedDay] = useState(todayIndex ?? 0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [menu, setMenu] = useState<WeekMenu>(weekMenu);
  const [modalVisible, setModalVisible] = useState(false);
  const [changingMealType, setChangingMealType] = useState<MealType>('comida');

  const opacity = useRef(new Animated.Value(1)).current;

  const animateChange = useCallback((fn: () => void) => {
    Animated.timing(opacity, { toValue: 0, duration: 90, useNativeDriver: true }).start(() => {
      fn();
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    });
  }, [opacity]);

  const handleDaySelect = (index: number) => {
    if (index === selectedDay) return;
    animateChange(() => setSelectedDay(index));
  };

  const handlePrevWeek = () => animateChange(() => setWeekOffset((w) => w - 1));
  const handleNextWeek = () => animateChange(() => setWeekOffset((w) => w + 1));

  const handleChangeMeal = (mealType: MealType) => {
    setChangingMealType(mealType);
    setModalVisible(true);
  };

  const handleSelectAlternative = (recipe: Recipe) => {
    setMenu((prev) => {
      const next = [...prev];
      const day = { ...next[selectedDay] };
      if (changingMealType === 'comida') {
        day.comida = recipe;
      } else {
        day.cena = recipe;
      }
      next[selectedDay] = day;
      return next;
    });
    setModalVisible(false);
  };

  const navigateToDetail = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe-detail',
      params: { data: JSON.stringify(recipe) },
    });
  };

  const monday = getWeekMonday(weekOffset);
  const weekLabel = formatWeekLabel(monday);
  const dayDateLabel = getDayDateLabel(selectedDay, monday);
  const currentDay = menu[selectedDay];
  const isCurrentWeek = weekOffset === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WeekHeader weekLabel={weekLabel} onPrev={handlePrevWeek} onNext={handleNextWeek} />

      <DaySelector
        selectedIndex={selectedDay}
        todayIndex={isCurrentWeek ? todayIndex : null}
        fullDayLabel={dayDateLabel}
        onSelect={handleDaySelect}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity }}>
          <MealCard
            mealType="comida"
            recipe={currentDay.comida}
            onPress={() => navigateToDetail(currentDay.comida)}
            onChangePress={() => handleChangeMeal('comida')}
          />
          <MealCard
            mealType="cena"
            recipe={currentDay.cena}
            onPress={() => navigateToDetail(currentDay.cena)}
            onChangePress={() => handleChangeMeal('cena')}
          />
          <TouchableOpacity style={styles.audioBtn} onPress={showAudioToast} activeOpacity={0.7}>
            <Feather name="volume-2" size={16} color={Colors.carbon} />
            <Text style={styles.audioBtnText}>Modo Audio-Chef</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <ChangeMealModal
        visible={modalVisible}
        mealType={changingMealType}
        onSelect={handleSelectAlternative}
        onClose={() => setModalVisible(false)}
      />
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontFamily: FontFamily.playfairSemiBold,
    fontSize: 24,
    color: Colors.carbon,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    color: Colors.piedra,
    textAlign: 'center',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.greige,
    marginTop: Spacing.sm,
  },
  audioBtnText: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    color: Colors.carbon,
  },
});
