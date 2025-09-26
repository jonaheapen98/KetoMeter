import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setPremiumStatus } from '../lib/database';

const VALID_REFERRAL_CODE = 'UNLOCK50';

export default function ReferralCodeScreen({ navigation }) {
  const [referralCode, setReferralCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleCodeChange = (text) => {
    // Force uppercase
    setReferralCode(text.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }

    if (referralCode.trim() !== VALID_REFERRAL_CODE) {
      Alert.alert('Invalid Code', 'The referral code you entered is not valid. Please check and try again.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Set premium status to true forever (no expiration)
      await setPremiumStatus(true, 'referral', null);
      
      Alert.alert(
        'Premium Activated!',
        'Congratulations! Your premium access has been activated. Welcome to KetoMeter Premium!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to home screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error activating premium:', error);
      Alert.alert('Error', 'Failed to activate premium. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="gift" size={64} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Enter Referral Code</Text>
        <Text style={styles.subtitle}>
          Have a referral code? Enter it below to unlock premium features.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={referralCode}
            onChangeText={handleCodeChange}
            placeholder="Enter referral code"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!referralCode.trim() || isProcessing) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!referralCode.trim() || isProcessing}
        >
          <Text style={styles.submitButtonText}>
            {isProcessing ? 'Processing...' : 'Activate Premium'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Feather name="info" size={16} color="#666" />
          <Text style={styles.infoText}>
            Referral codes are case-sensitive and must be entered exactly as provided.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
