import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { isOnboardingComplete, initDatabase, isUserPremium } from '../lib/database';
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
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createStackNavigator();

export default function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSkipped, setPaymentSkipped] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, [refreshKey]);

  // Function to trigger a re-check of onboarding status
  const triggerOnboardingCheck = () => {
    console.log('Triggering onboarding check...');
    setRefreshKey(prev => prev + 1);
  };

  // Function to handle payment completion
  const handlePaymentComplete = () => {
    console.log('Payment completed, checking status...');
    setRefreshKey(prev => prev + 1);
  };

  // Function to handle payment skip
  const handlePaymentSkip = () => {
    console.log('Payment skipped, going to main app...');
    setPaymentSkipped(true);
    setShowPayment(false);
  };

  const checkOnboardingStatus = async () => {
    try {
      // Ensure database is initialized first
      await initDatabase();
      console.log('Database initialized, checking onboarding status...');
      
      const onboardingComplete = await isOnboardingComplete();
      console.log('Onboarding complete status:', onboardingComplete);
      
      if (!onboardingComplete) {
        setShowOnboarding(true);
        setShowPayment(false);
        setPaymentSkipped(false);
      } else {
        // Check if user is premium
        const isPremium = await isUserPremium();
        console.log('User premium status:', isPremium);
        
        if (!isPremium && !paymentSkipped) {
          setShowPayment(true);
          setShowOnboarding(false);
        } else {
          setShowPayment(false);
          setShowOnboarding(false);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setShowOnboarding(true);
      setShowPayment(false);
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
        <>
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={triggerOnboardingCheck} />}
          </Stack.Screen>
          <Stack.Screen 
            name="Payment" 
            options={{ gestureEnabled: false }}
          >
            {(props) => <PaymentScreen {...props} onComplete={triggerOnboardingCheck} />}
          </Stack.Screen>
        </>
      ) : showPayment ? (
        <Stack.Screen 
          name="Payment" 
          options={{ gestureEnabled: false }}
        >
          {(props) => <PaymentScreen {...props} onComplete={handlePaymentComplete} onSkip={handlePaymentSkip} />}
        </Stack.Screen>
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
            options={{ gestureEnabled: false }}
          >
            {(props) => <SettingsScreen {...props} onOnboardingReset={triggerOnboardingCheck} />}
          </Stack.Screen>
          <Stack.Screen 
            name="Info" 
            component={InfoScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
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
