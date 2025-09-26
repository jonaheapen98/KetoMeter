import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { isOnboardingComplete, initDatabase, isUserPremium, setPremiumStatus, getPremiumStatus } from '../lib/database';
import { initializeRevenueCat, getCustomerInfo, hasActiveSubscription } from '../lib/revenuecat';
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
import ReferralCodeScreen from '../screens/ReferralCodeScreen';

const Stack = createStackNavigator();

export default function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      checkOnboardingStatus();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [refreshKey]);

  // Function to trigger a re-check of onboarding status
  const triggerOnboardingCheck = (navigation, forceOnboarding = false) => {
    console.log('Triggering onboarding check...', forceOnboarding ? '(forced to onboarding)' : '');
    
    // If navigation is provided, use it to navigate directly
    if (navigation) {
      if (forceOnboarding) {
        console.log('Using navigation to go to Onboarding screen');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
        setShowOnboarding(true);
        setShowPaywall(false);
      } else {
        console.log('Using navigation to go to Payment screen');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Payment' }],
        });
        setShowOnboarding(false);
        setShowPaywall(true);
      }
    } else {
      // Fallback to state-based approach
      setRefreshKey(prev => prev + 1);
    }
  };

  // Function to handle payment completion
  const handlePaymentComplete = () => {
    console.log('Payment completed, refreshing app...');
    setRefreshKey(prev => prev + 1);
  };

  // Function to handle paywall close (X button)
  const handlePaywallClose = (navigation) => {
    console.log('MainApp: Paywall closed, navigating to main app');
    setShowPaywall(false);
    // Use navigation to go to MainTabs
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  // Sync local premium status with RevenueCat
  const syncWithRevenueCat = async () => {
    try {
      console.log('MainApp: Syncing with RevenueCat...');
      
      // Get current local premium status
      const localStatus = await getPremiumStatus();
      console.log('Local premium status:', localStatus);
      
      // Skip sync for referral users (they have permanent premium)
      if (localStatus.premiumType === 'referral') {
        console.log('MainApp: Referral user detected, skipping RevenueCat sync');
        return localStatus.isPremium;
      }
      
      // Only sync if user has a subscription-based premium status
      if (localStatus.isPremium && (localStatus.premiumType === 'yearly' || localStatus.premiumType === 'weekly' || localStatus.premiumType === 'restored')) {
        // Initialize RevenueCat
        const initialized = await initializeRevenueCat();
        if (!initialized) {
          console.log('MainApp: RevenueCat not initialized, keeping local status');
          return localStatus.isPremium;
        }
        
        // Get current RevenueCat customer info
        const customerInfo = await getCustomerInfo();
        if (!customerInfo) {
          console.log('MainApp: No customer info from RevenueCat, keeping local status');
          return localStatus.isPremium;
        }
        
        // Check if subscription is still active
        const hasActive = hasActiveSubscription(customerInfo);
        console.log('RevenueCat subscription active:', hasActive);
        
        if (!hasActive && localStatus.isPremium) {
          // Subscription expired, update local database
          console.log('MainApp: Subscription expired, updating local status to free');
          await setPremiumStatus(false, localStatus.premiumType, localStatus.premiumExpiresAt);
          return false;
        } else if (hasActive && !localStatus.isPremium) {
          // Subscription is active but local shows expired, restore premium
          console.log('MainApp: Subscription active, restoring local premium status');
          await setPremiumStatus(true, localStatus.premiumType || 'restored', null);
          return true;
        }
        
        return hasActive;
      }
      
      // For non-premium users or users without subscription type, return current status
      return localStatus.isPremium;
      
    } catch (error) {
      console.error('MainApp: Error syncing with RevenueCat:', error);
      // On error, return current local status to avoid disrupting user experience
      const localStatus = await getPremiumStatus();
      return localStatus.isPremium;
    }
  };

  const checkOnboardingStatus = async () => {
    if (isCheckingStatus) {
      console.log('MainApp: Already checking status, skipping...');
      return;
    }
    
    console.log('MainApp: checkOnboardingStatus called');
    setIsCheckingStatus(true);
    
    try {
      // Ensure database is initialized first
      await initDatabase();
      console.log('Database initialized, checking onboarding status...');
      
      const onboardingComplete = await isOnboardingComplete();
      console.log('Onboarding complete status:', onboardingComplete);
      
      if (!onboardingComplete) {
        console.log('MainApp: Showing onboarding');
        setShowOnboarding(true);
        setShowPaywall(false);
        setIsLoading(false);
      } else {
        // Onboarding is complete, sync with RevenueCat and check premium status
        const isPremium = await syncWithRevenueCat();
        console.log('User premium status after sync:', isPremium);
        
        if (!isPremium) {
          console.log('MainApp: User not premium, showing paywall');
          setShowOnboarding(false);
          setShowPaywall(true);
          setIsLoading(false);
        } else {
          console.log('MainApp: User is premium, going to main app');
          setShowOnboarding(false);
          setShowPaywall(false);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setShowOnboarding(true);
      setShowPaywall(false);
      setIsLoading(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  console.log('MainApp: Rendering with state - showOnboarding:', showOnboarding, 'showPaywall:', showPaywall);

  // Determine initial route based on state
  let initialRouteName;
  if (showOnboarding) {
    initialRouteName = 'Onboarding';
  } else if (showPaywall) {
    initialRouteName = 'Payment';
  } else {
    initialRouteName = 'MainTabs';
  }

  return (
    <Stack.Navigator 
      key={`${showOnboarding}-${showPaywall}`}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding">
        {(props) => <OnboardingScreen {...props} onComplete={() => triggerOnboardingCheck(props.navigation)} />}
      </Stack.Screen>
      <Stack.Screen name="Payment" options={{ gestureEnabled: false }}>
        {(props) => <PaymentScreen {...props} onClose={() => handlePaywallClose(props.navigation)} />}
      </Stack.Screen>
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
        {(props) => <SettingsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Info" 
        component={InfoScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="ReferralCode" 
        component={ReferralCodeScreen}
        options={{ gestureEnabled: false }}
      />
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
