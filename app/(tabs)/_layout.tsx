import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily } from '../../src/constants/tokens';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface TabIcon {
  icon: FeatherName;
  color: string;
  size: number;
}

function icon(name: FeatherName) {
  return ({ color, size }: Omit<TabIcon, 'icon'>) => (
    <Feather name={name} color={color} size={size} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Menú', tabBarLabel: 'Menú', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="nevera" options={{ title: 'Nevera', tabBarLabel: 'Nevera', tabBarIcon: icon('thermometer') }} />
      <Tabs.Screen name="compra" options={{ title: 'Compra', tabBarLabel: 'Compra', tabBarIcon: icon('shopping-cart') }} />
      <Tabs.Screen name="monedero" options={{ title: 'Monedero', tabBarLabel: 'Monedero', tabBarIcon: icon('credit-card') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarLabel: 'Perfil', tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
