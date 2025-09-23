import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import BottomTabNavigator from './components/BottomTabNavigator';
import TypeFoodScreen from './screens/TypeFoodScreen';
import AnalyzeScreen from './screens/AnalyzeScreen';
import ReportScreen from './screens/ReportScreen';
import CameraScreen from './screens/CameraScreen';
import ImagePreviewScreen from './screens/ImagePreviewScreen';
import MenuCameraScreen from './screens/MenuCameraScreen';
import MenuImagePreviewScreen from './screens/MenuImagePreviewScreen';
import MenuReportScreen from './screens/MenuReportScreen';
import { initDatabase } from './lib/database';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    const initializeApp = async () => {
      if (fontsLoaded) {
        try {
          // Initialize database
          await initDatabase();
          console.log('Database initialized');
        } catch (error) {
          console.error('Error initializing database:', error);
        }
        
        SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#fff" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="TypeFood" component={TypeFoodScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
          <Stack.Screen name="MenuCamera" component={MenuCameraScreen} />
          <Stack.Screen name="MenuImagePreview" component={MenuImagePreviewScreen} />
          <Stack.Screen 
            name="Analyze" 
            component={AnalyzeScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="MenuAnalyze" 
            component={AnalyzeScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Report" 
            component={ReportScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="MenuReport" 
            component={MenuReportScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
