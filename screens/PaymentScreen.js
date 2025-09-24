import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentScreen({ navigation, onComplete }) {
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    // If we're in onboarding flow, go back to onboarding
    // If we're in main app, go back to main app
    navigation.goBack();
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

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log('Selected plan:', selectedPlan);
    console.log('Free trial enabled:', freeTrialEnabled);
    
    // Trigger completion to switch to main app
    if (onComplete) {
      onComplete();
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
                  <Text style={styles.originalPrice}>₹2,999.00</Text>
                  <Text style={styles.discountedPrice}>₹299.00 per year</Text>
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
                <Text style={styles.trialPrice}>then ₹99.00 per week</Text>
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
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Try for Free</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Use & Privacy Policy</Text>
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
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECDC4',
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    justifyContent: 'space-between',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
});
