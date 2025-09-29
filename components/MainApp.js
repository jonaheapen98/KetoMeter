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

  // Set up periodic background sync for subscription validation
  useEffect(() => {
    let syncInterval = null;
    
    const startBackgroundSync = async () => {
      try {
        const localStatus = await getPremiumStatus();
        if (localStatus.isPremium && localStatus.premiumType !== 'referral') {
          // Run background sync every 5 minutes
          syncInterval = setInterval(() => {
            backgroundSyncWithRevenueCat();
          }, 5 * 60 * 1000); // 5 minutes
        }
      } catch (error) {
        console.error('Error starting background sync:', error);
      }
    };
    
    startBackgroundSync();
    
    // Return cleanup function
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [showPaywall]); // Re-run when paywall state changes

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

  // Background sync with RevenueCat (non-blocking)
  const backgroundSyncWithRevenueCat = async () => {
    try {
      console.log('MainApp: Starting background sync with RevenueCat...');
      
      // Get current local premium status
      const localStatus = await getPremiumStatus();
      
      // Skip sync for referral users (they have permanent premium)
      if (localStatus.premiumType === 'referral') {
        console.log('MainApp: Referral user detected, skipping background sync');
        return;
      }
      
      // Initialize RevenueCat
      const initialized = await initializeRevenueCat();
      if (!initialized) {
        console.log('MainApp: RevenueCat not initialized for background sync');
        return;
      }
      
      // Get current RevenueCat customer info
      const customerInfo = await getCustomerInfo();
      if (!customerInfo) {
        console.log('MainApp: No customer info from RevenueCat in background sync - keeping local status unchanged');
        return;
      }
      
      // Check if subscription is active in RevenueCat
      const hasActive = hasActiveSubscription(customerInfo);
      console.log('Background sync - RevenueCat subscription active:', hasActive);
      
      // Only update local database if we have valid RevenueCat data
      if (hasActive && !localStatus.isPremium) {
        // Subscription is active in RevenueCat but local shows expired, restore premium
        console.log('MainApp: Background sync - restoring premium status');
        await setPremiumStatus(true, 'restored', null);
      } else if (!hasActive && localStatus.isPremium) {
        // Only expire subscription if we're certain it's expired in RevenueCat
        // This should only happen if we successfully got customer info and it shows expired
        console.log('MainApp: Background sync - subscription confirmed expired in RevenueCat, updating local status');
        await setPremiumStatus(false, localStatus.premiumType, localStatus.premiumExpiresAt);
        
        // If user is currently in the app, we might want to show a notification
        // or handle the expiration gracefully
        console.log('MainApp: User subscription has expired, will show paywall on next app restart');
      } else {
        console.log('MainApp: Background sync - no changes needed, local and RevenueCat status match');
      }
      
    } catch (error) {
      console.error('MainApp: Error in background sync with RevenueCat:', error);
      // Don't throw error in background sync - it shouldn't affect user experience
    }
  };

  // Sync local premium status with RevenueCat (blocking - used during app startup)
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
      
      // Always try to initialize RevenueCat and check subscription status
      // This ensures we catch subscriptions that were purchased but not synced locally
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
      
      // Check if subscription is active in RevenueCat
      const hasActive = hasActiveSubscription(customerInfo);
      console.log('RevenueCat subscription active:', hasActive);
      
      // Always sync the local database with RevenueCat status
      if (hasActive && !localStatus.isPremium) {
        // Subscription is active in RevenueCat but local shows expired, restore premium
        console.log('MainApp: Subscription active in RevenueCat, restoring local premium status');
        await setPremiumStatus(true, 'restored', null);
        return true;
      } else if (!hasActive && localStatus.isPremium) {
        // Subscription expired in RevenueCat, update local database
        console.log('MainApp: Subscription expired in RevenueCat, updating local status to free');
        await setPremiumStatus(false, localStatus.premiumType, localStatus.premiumExpiresAt);
        return false;
      }
      
      // If both local and RevenueCat agree, return the local status (which matches RevenueCat)
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
        // Onboarding is complete, check local premium status first
        const localStatus = await getPremiumStatus();
        console.log('Local premium status:', localStatus);
        
        if (localStatus.isPremium) {
          // User appears to be premium locally, show home screen immediately
          console.log('MainApp: User appears premium locally, showing home screen immediately');
          setShowOnboarding(false);
          setShowPaywall(false);
          setIsLoading(false);
          
          // Start background sync to validate subscription
          backgroundSyncWithRevenueCat();
        } else {
          // User is not premium locally, sync with RevenueCat to check for new subscriptions
          console.log('MainApp: User not premium locally, syncing with RevenueCat...');
          const isPremium = await syncWithRevenueCat();
          console.log('User premium status after sync:', isPremium);
          
          if (!isPremium) {
            console.log('MainApp: User not premium, showing paywall');
            setShowOnboarding(false);
            setShowPaywall(true);
            setIsLoading(false);
          } else {
            console.log('MainApp: User is premium after sync, going to main app');
            setShowOnboarding(false);
            setShowPaywall(false);
            setIsLoading(false);
          }
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
