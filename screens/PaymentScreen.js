import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  initializeRevenueCat, 
  getOfferings, 
  purchasePackage, 
  restorePurchases,
  hasActiveSubscription,
  getSubscriptionStatus,
  getCustomerInfo 
} from '../lib/revenuecat';
import { setPremiumStatus } from '../lib/database';

export default function PaymentScreen({ navigation, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Initialize RevenueCat and fetch offerings
  useEffect(() => {
    initializeApp();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Initialize RevenueCat
      const initialized = await initializeRevenueCat();
      if (!initialized) {
        throw new Error('Failed to initialize payment system');
      }

      // Get current customer info
      const customer = await getCustomerInfo();
      setCustomerInfo(customer);

      // Check if user already has active subscription
      if (customer && hasActiveSubscription(customer)) {
        Alert.alert(
          'Already Subscribed',
          'You already have an active subscription. Redirecting to the app...',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home if already subscribed
                if (onClose) {
                  onClose();
                } else {
                  navigation.navigate('MainTabs');
                }
              }
            }
          ]
        );
        return;
      }

      // Fetch available offerings
      const availableOfferings = await getOfferings();
      setOfferings(availableOfferings);

    } catch (error) {
      console.error('Error initializing app:', error);
      // Don't show error alert, just proceed with fallback pricing
      console.log('Using fallback pricing due to RevenueCat error');
      setOfferings(null); // This will trigger fallback pricing
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isClosing) {
      console.log('PaymentScreen: Already closing, ignoring button press');
      return;
    }
    
    console.log('PaymentScreen: Close button pressed');
    setIsClosing(true);
    
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Add a small delay to prevent rapid button presses
    closeTimeoutRef.current = setTimeout(() => {
      if (onClose) {
        console.log('PaymentScreen: Using onClose callback');
        onClose(); // Tell MainApp to close paywall
      } else {
        console.log('PaymentScreen: Using navigation fallback');
        // Fallback for when PaymentScreen is accessed from main app
        navigation.navigate('MainTabs');
      }
    }, 100);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Auto-update toggle based on plan selection
    if (plan === 'trial') {
      setFreeTrialEnabled(true);
    } else if (plan === 'yearly') {
      setFreeTrialEnabled(false);
    }
  };

  const handleToggleTrial = () => {
    setFreeTrialEnabled(!freeTrialEnabled);
    if (!freeTrialEnabled) {
      setSelectedPlan('trial');
    } else {
      setSelectedPlan('yearly');
    }
  };

  const handleSubscribe = async () => {
    // Check if we're in Expo Go environment (not TestFlight/Production)
    const isExpoGo = __DEV__ && (!offerings || !offerings.current);
    
    if (isExpoGo) {
      // Only show demo mode in Expo Go development
      Alert.alert(
        'Demo Mode',
        'This is a demo version. In production, this would process your payment.',
        [
          {
            text: 'Continue',
            onPress: async () => {
              // Set premium status for demo purposes
              const premiumType = selectedPlan === 'yearly' ? 'yearly' : 'weekly';
              await setPremiumStatus(true, premiumType);
              
              // Navigate to home after purchase
              if (onClose) {
                onClose();
              } else {
                navigation.navigate('MainTabs');
              }
            }
          }
        ]
      );
      return;
    }

    try {
      setPurchasing(true);
      
      // If no offerings available, try to initialize RevenueCat and get offerings
      if (!offerings || !offerings.current) {
        console.log('No offerings available, attempting to reinitialize RevenueCat...');
        const initialized = await initializeRevenueCat();
        if (initialized) {
          const freshOfferings = await getOfferings();
          if (freshOfferings && freshOfferings.current) {
            setOfferings(freshOfferings);
            // Continue with the fresh offerings
          } else {
            throw new Error('Unable to load subscription options. Please check your internet connection and try again.');
          }
        } else {
          throw new Error('Unable to initialize payment system. Please try again.');
        }
      }
      
      // Find the selected package
      let packageToPurchase;
      const availablePackages = (offerings?.current?.availablePackages) || [];
      
      if (selectedPlan === 'yearly') {
        // Look for yearly package
        packageToPurchase = availablePackages.find(pkg => 
          pkg.packageType === 'ANNUAL' || 
          pkg.identifier.includes('yearly') ||
          pkg.identifier === 'ketometer_yearly' ||
          pkg.product.identifier === 'ketometer_yearly'
        );
      } else if (selectedPlan === 'trial') {
        // Look for weekly package (trial)
        packageToPurchase = availablePackages.find(pkg => 
          pkg.packageType === 'WEEKLY' || 
          pkg.identifier.includes('weekly') ||
          pkg.identifier === 'ketometer_weekly' ||
          pkg.product.identifier === 'ketometer_weekly'
        );
      }

      if (!packageToPurchase) {
        throw new Error('Selected subscription plan not found');
      }

      console.log('Purchasing package:', packageToPurchase.identifier);
      
      // Attempt purchase
      const result = await purchasePackage(packageToPurchase);
      
      if (result.success) {
        // Set premium status in database
        const premiumType = selectedPlan === 'yearly' ? 'yearly' : 'weekly';
        await setPremiumStatus(true, premiumType);
        
        Alert.alert(
          'Success!',
          'Your subscription is now active. Welcome to KetoMeter Premium!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to home after successful purchase
                if (onClose) {
                  onClose();
                } else {
                  navigation.navigate('MainTabs');
                }
              }
            }
          ]
        );
      } else if (result.userCancelled) {
        // User cancelled, no action needed
        console.log('Purchase cancelled by user');
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      
      // Check if we're in Expo Go environment (not TestFlight/Production)
      const isExpoGo = __DEV__ && (!offerings || !offerings.current);
      
      if (isExpoGo) {
        // Only show demo mode in Expo Go development
        Alert.alert(
          'Demo Mode',
          'Restore purchases is not available in demo mode.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // If no offerings available, try to initialize RevenueCat first
      if (!offerings || !offerings.current) {
        console.log('No offerings available for restore, attempting to reinitialize RevenueCat...');
        const initialized = await initializeRevenueCat();
        if (initialized) {
          const freshOfferings = await getOfferings();
          if (freshOfferings && freshOfferings.current) {
            setOfferings(freshOfferings);
          }
        }
      }
      
      const result = await restorePurchases();
      
      if (result.success) {
        const hasActive = hasActiveSubscription(result.customerInfo);
        
        if (hasActive) {
          // Set premium status in database
          await setPremiumStatus(true, 'restored');
          
          Alert.alert(
            'Purchases Restored',
            'Your previous purchases have been restored successfully!',
            [
              {
                text: 'Continue',
              onPress: () => {
                // Navigate to home after restore
                if (onClose) {
                  onClose();
                } else {
                  navigation.navigate('MainTabs');
                }
              }
              }
            ]
          );
        } else {
          Alert.alert(
            'No Purchases Found',
            'No previous purchases were found to restore.',
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(result.error || 'Failed to restore purchases');
      }
      
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        error.message || 'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  // Get pricing from RevenueCat offerings
  const getPricingInfo = () => {
    if (!offerings?.current?.availablePackages) {
      // Fallback pricing - use USD as it's more universal for TestFlight
      return {
        yearly: { price: '$29/year', originalPrice: '$299.99' },
        weekly: { price: '$4.99/week', trialText: 'FREE' }
      };
    }

    const packages = offerings.current.availablePackages;
    const yearlyPackage = packages.find(pkg => 
      pkg.packageType === 'ANNUAL' || 
      pkg.identifier.includes('yearly') ||
      pkg.identifier === 'ketometer_yearly' ||
      pkg.product.identifier === 'ketometer_yearly'
    );
    const weeklyPackage = packages.find(pkg => 
      pkg.packageType === 'WEEKLY' || 
      pkg.identifier.includes('weekly') ||
      pkg.identifier === 'ketometer_weekly' ||
      pkg.product.identifier === 'ketometer_weekly'
    );

    return {
      yearly: {
        price: yearlyPackage?.product.priceString || '$29/year',
        originalPrice: '$299.99'
      },
      weekly: {
        price: weeklyPackage?.product.priceString || '$4.99/week',
        trialText: 'FREE'
      }
    };
  };

  const pricing = getPricingInfo();

  // Get dynamic CTA text based on selected plan
  const getCtaText = () => {
    if (selectedPlan === 'yearly') {
      return 'Unlock Now';
    } else if (selectedPlan === 'trial') {
      return 'Try for Free';
    }
    return 'Subscribe';
  };

  // Handle opening external links
  const handleLinkPress = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Close Button */}
      <TouchableOpacity style={[styles.closeButton, { top: insets.top + 16 }]} onPress={handleClose}>
        <Feather name="x" size={24} color="#8E8E93" />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Visual */}
        <View style={styles.visualContainer}>
          <View style={styles.iconContainer}>
            <Feather name="zap" size={48} color="#4ECDC4" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Unlimited Access</Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="search" size={16} color="#4ECDC4" />
            </View>
            <Text style={styles.featureText}>Analyze unlimited food items</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="camera" size={16} color="#4ECDC4" />
            </View>
            <Text style={styles.featureText}>Scan menus & nutrition labels</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="book-open" size={16} color="#4ECDC4" />
            </View>
            <Text style={styles.featureText}>Get personalized keto insights</Text>
          </View>

        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected
            ]}
            onPress={() => handlePlanSelect('yearly')}
          >
            <View style={styles.planContent}>
              <View style={styles.planLeft}>
                <Text style={styles.planTitle}>Yearly Plan</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>{pricing.yearly.originalPrice}</Text>
                  <Text style={styles.discountedPrice}>{pricing.yearly.price}</Text>
                </View>
              </View>
              <View style={styles.planRight}>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>SAVE 90%</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'yearly' && styles.radioButtonSelected
                ]}>
                  {selectedPlan === 'yearly' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 3-Day Trial */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'trial' && styles.planCardSelected
            ]}
            onPress={() => handlePlanSelect('trial')}
          >
            <View style={styles.planContent}>
              <View style={styles.planLeft}>
                <Text style={styles.planTitle}>3-Day Trial</Text>
                <Text style={styles.trialPrice}>then {pricing.weekly.price}</Text>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.freeText}>FREE</Text>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'trial' && styles.radioButtonSelected
                ]}>
                  {selectedPlan === 'trial' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Free Trial Toggle */}
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Free Trial Enabled</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                freeTrialEnabled && styles.toggleActive
              ]}
              onPress={handleToggleTrial}
            >
              <View style={[
                styles.toggleThumb,
                freeTrialEnabled && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 4 }]}>
          <TouchableOpacity 
            style={[styles.subscribeButton, purchasing && styles.subscribeButtonDisabled]} 
            onPress={handleSubscribe}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.subscribeButtonText}>{getCtaText()}</Text>
                <Feather name="chevron-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
            <Text style={[styles.footerLink, purchasing && styles.footerLinkDisabled]}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLinkPress('https://www.prtcl10.com/ketometer/termsandconditions', 'Terms of Use')}>
            <Text style={styles.footerLink}>Terms of Use</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLinkPress('https://www.prtcl10.com/ketometer/privacypolicy', 'Privacy Policy')}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    flex: 1,
  },
  plansContainer: {
    marginBottom: 0,
  },
  toggleWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  planCardSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planLeft: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  trialPrice: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  planRight: {
    alignItems: 'flex-end',
  },
  saveBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  saveText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  freeText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4ECDC4',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4ECDC4',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  subscribeButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginRight: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
  footerLinkDisabled: {
    color: '#C7C7CC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginTop: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
});
