import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isUserPremium, setPremiumStatus, resetOnboarding } from '../lib/database';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const premium = await isUserPremium();
      setIsPremium(premium);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    }
  };

  const handleStartOnboarding = () => {
    Alert.alert(
      'Reset App State',
      'This will reset the app\'s onboarding and premium state. You\'ll need to restart the app to see the changes. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset premium status
              await setPremiumStatus(false, null);
              
              // Reset onboarding
              await resetOnboarding();
              
              Alert.alert(
                'Reset Complete',
                'App state has been reset. Please restart the app to see the onboarding flow.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to main app - it will detect onboarding needs to be shown
                      navigation.navigate('MainTabs');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error resetting app state:', error);
              Alert.alert('Error', 'Failed to reset app state. Please try again.');
            }
          }
        }
      ]
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings List */}
      <View style={styles.content}>
        <View style={styles.settingsList}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleLinkPress('https://www.prtcl10.com/ketometer/termsandconditions', 'Terms and Conditions')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="file-text" size={20} color="#007AFF" />
                </View>
                <Text style={styles.settingItemTitle}>Terms and Conditions</Text>
              </View>
              <Feather name="external-link" size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleLinkPress('https://www.prtcl10.com/ketometer/privacypolicy', 'Privacy Policy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="shield" size={20} color="#007AFF" />
                </View>
                <Text style={styles.settingItemTitle}>Privacy Policy</Text>
              </View>
              <Feather name="external-link" size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>

          {!isPremium && (
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('ReferralCode')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.iconContainer}>
                    <Feather name="gift" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.settingItemTitle}>Use Referral Code</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          )}

          {/* Debug Button - Only show in development */}
          {/* {__DEV__ && (
            <TouchableOpacity 
              style={[styles.settingItem, styles.debugButton]}
              onPress={handleStartOnboarding}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <View style={styles.settingItemLeft}>
                  <View style={[styles.iconContainer, styles.debugIconContainer]}>
                    <Feather name="refresh-cw" size={20} color="#FF6B6B" />
                  </View>
                  <Text style={[styles.settingItemTitle, styles.debugText]}>Start Onboarding</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  settingsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  settingItem: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#000',
  },
  // Debug button styles
  debugButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE5E5',
  },
  debugIconContainer: {
    backgroundColor: '#FFE5E5',
  },
  debugText: {
    color: '#FF6B6B',
    fontFamily: 'Inter_600SemiBold',
  },
});
