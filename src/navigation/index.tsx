import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily } from '../constants/tokens';
import { RootTabParamList, RootStackParamList } from '../types';
import MenuScreen from '../screens/MenuScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuHome" component={MenuScreen} />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

const NeveraScreen = () => <PlaceholderScreen label="Tu nevera" />;
const CompraScreen = () => <PlaceholderScreen label="Lista de la compra" />;
const MonederoScreen = () => <PlaceholderScreen label="Tu monedero" />;
const PerfilScreen = () => <PlaceholderScreen label="Tu perfil" />;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const TAB_ICONS: Record<keyof RootTabParamList, FeatherIconName> = {
  'Menú': 'calendar',
  'Nevera': 'thermometer',
  'Compra': 'shopping-cart',
  'Monedero': 'credit-card',
  'Perfil': 'user',
};

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICONS[route.name as keyof RootTabParamList]} size={size} color={color} />
        ),
        tabBarActiveTintColor: Colors.coral,
        tabBarInactiveTintColor: Colors.greige,
        tabBarStyle: {
          backgroundColor: Colors.blanco,
          borderTopWidth: 1,
          borderTopColor: 'rgba(183,173,162,0.25)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.interMedium,
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen name="Menú" component={MenuStack} />
      <Tab.Screen name="Nevera" component={NeveraScreen} />
      <Tab.Screen name="Compra" component={CompraScreen} />
      <Tab.Screen name="Monedero" component={MonederoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
