// App.tsx — Root entry point
import 'react-native-gesture-handler'; // MUST be the very first import
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
