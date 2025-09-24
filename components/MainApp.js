import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { isOnboardingComplete, initDatabase } from '../lib/database';
import BottomTabNavigator from './BottomTabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import TypeFoodScreen from '../screens/TypeFoodScreen';
import AnalyzeScreen from '../screens/AnalyzeScreen';
import ReportScreen from '../screens/ReportScreen';
import CameraScreen from '../screens/CameraScreen';
import ImagePreviewScreen from '../screens/ImagePreviewScreen';
import MenuCameraScreen from '../screens/MenuCameraScreen';
import MenuImagePreviewScreen from '../screens/MenuImagePreviewScreen';
import MenuReportScreen from '../screens/MenuReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InfoScreen from '../screens/InfoScreen';

const Stack = createStackNavigator();

export default function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Ensure database is initialized first
      await initDatabase();
      console.log('Database initialized, checking onboarding status...');
      
      const onboardingComplete = await isOnboardingComplete();
      console.log('Onboarding complete status:', onboardingComplete);
      setShowOnboarding(!onboardingComplete);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen 
            name="TypeFood" 
            component={TypeFoodScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Analyze" 
            component={AnalyzeScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Report" 
            component={ReportScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="ImagePreview" 
            component={ImagePreviewScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="MenuCamera" 
            component={MenuCameraScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="MenuImagePreview" 
            component={MenuImagePreviewScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="MenuReport" 
            component={MenuReportScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Info" 
            component={InfoScreen}
            options={{ gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
