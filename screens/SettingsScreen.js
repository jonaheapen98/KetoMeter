import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetOnboarding, clearAllSettings } from '../lib/database';

export default function SettingsScreen({ navigation, onOnboardingReset }) {
  const insets = useSafeAreaInsets();

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

  const handleStartOnboarding = () => {
    Alert.alert(
      'Start Onboarding',
      'This will reset your onboarding state and show the onboarding flow again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Onboarding',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert(
                'Success',
                'Onboarding state reset. The app will now show the onboarding flow.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      // Trigger onboarding check in MainApp
                      if (onOnboardingReset) {
                        onOnboardingReset();
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding state. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearAllSettings = () => {
    Alert.alert(
      'Clear All Settings',
      'This will clear all app settings including onboarding state. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllSettings();
              Alert.alert(
                'Success',
                'All settings cleared. The app will now show the onboarding flow.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      // Trigger onboarding check in MainApp
                      if (onOnboardingReset) {
                        onOnboardingReset();
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear settings. Please try again.');
            }
          },
        },
      ]
    );
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

          {/* Debug Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Debug</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleStartOnboarding}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="refresh-cw" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.settingItemTitle}>Start Onboarding</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearAllSettings}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="trash-2" size={20} color="#F44336" />
                </View>
                <Text style={styles.settingItemTitle}>Clear All Settings</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItem: {
    paddingVertical: 20,
    paddingHorizontal: 20,
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
});
