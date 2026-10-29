// src/navigation/RootNavigator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import JobsScreen from '../screens/worker/JobsScreen';
import MapScreen from '../screens/worker/MapScreen';
import ProfileScreen from '../screens/worker/ProfileScreen';
import DashboardScreen from '../screens/hr/DashboardScreen';
import ConsoleScreen from '../screens/driver/ConsoleScreen';

// Components
import AnimatedTabBar from '../components/AnimatedTabBar';
import Footer from '../components/Footer';
import { navTheme, colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Role-specific tab groups ─────────────────────────────────────────────────

function WorkerTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HRTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Console" component={ConsoleScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
// In production: pull `userRole` from Firebase Auth context.
const USER_ROLE: 'WORKER' | 'INDUSTRY_HR' | 'DRIVER' = 'WORKER';

const TabsForRole = () => {
  switch (USER_ROLE) {
    case 'INDUSTRY_HR': return <HRTabs />;
    case 'DRIVER':      return <DriverTabs />;
    default:            return <WorkerTabs />;
  }
};

export default function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              // Native gestures per platform
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              contentStyle: { backgroundColor: colors.black },
            }}
          >
            <Stack.Screen name="Main" component={TabsForRole} />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Global branding footer — always rendered below navigator */}
        <Footer />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
});
