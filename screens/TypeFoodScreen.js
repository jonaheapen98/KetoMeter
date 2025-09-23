import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TypeFoodScreen({ navigation }) {
  const [foodDescription, setFoodDescription] = useState('');
  const insets = useSafeAreaInsets();

  const handleAnalyze = () => {
    // Navigate to Analyze screen
    navigation.navigate('Analyze');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Type and Describe</Text>
        </View>
        <View style={styles.headerIcon} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What are you about to eat?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type or paste your food description here..."
            placeholderTextColor="#999"
            value={foodDescription}
            onChangeText={setFoodDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for better analysis:</Text>
          <Text style={styles.tipText}>• Include ingredients and quantities</Text>
          <Text style={styles.tipText}>• Mention cooking methods (fried, baked, etc.)</Text>
          <Text style={styles.tipText}>• Add brand names if known</Text>
          <Text style={styles.tipText}>• Include sauces and condiments</Text>
        </View>
      </ScrollView>

      {/* Analyze Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.analyzeButton, { opacity: foodDescription.trim() ? 1 : 0.5 }]}
          onPress={handleAnalyze}
          disabled={!foodDescription.trim()}
        >
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        </TouchableOpacity>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  analyzeButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
});
