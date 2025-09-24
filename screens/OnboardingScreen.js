import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '../lib/database';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: "Get Started",
    subtitle: "Welcome to KetoMeter",
    description: "Your intelligent companion for the keto lifestyle. Get instant, accurate analysis of any food to stay on track with your ketogenic diet goals.",
    icon: "zap",
    color: "#4ECDC4",
    image: null
  },
  {
    id: 2,
    title: "Why Keto Tracking is Crucial",
    subtitle: "The Hidden Challenge",
    description: "Keto success isn't just about avoiding obvious carbs. Hidden sugars, starches, and additives lurk in restaurant meals, packaged foods, and even 'healthy' options. Without knowing what's really in your food, especially when dining out, your keto progress can be derailed by ingredients you never suspected.",
    icon: "target",
    color: "#FF6B35",
    image: null
  },
  {
    id: 3,
    title: "Type & Describe",
    subtitle: "Simple Text Analysis",
    description: "Just describe what you're eating in plain English. Our AI understands natural language and instantly provides detailed keto analysis, nutritional breakdown, and personalized recommendations to keep you on track.",
    icon: "edit-3",
    color: "#45B7D1",
    image: null
  },
  {
    id: 4,
    title: "Scan Food & Nutrition Labels",
    subtitle: "Visual Intelligence",
    description: "Point your camera at any food item or nutrition label. Our advanced AI instantly recognizes ingredients, analyzes nutritional content, and gives you a precise keto compatibility score with detailed insights.",
    icon: "camera",
    color: "#96CEB4",
    image: null
  },
  {
    id: 5,
    title: "Scan Menus",
    subtitle: "Find Keto-Friendly Options",
    description: "Never guess again at restaurants! Scan any menu and instantly discover which dishes are keto-friendly. We'll show you exactly what to order, what to avoid, and how to modify meals to fit your diet.",
    icon: "book-open",
    color: "#FFEAA7",
    image: null
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true
      });
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as complete in database
      await setOnboardingComplete();
      console.log('Onboarding completed successfully');
      
      // Navigate to main tabs
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still navigate even if database update fails
      navigation.replace('MainTabs');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true
      });
    }
  };

  const renderSlide = (item, index) => (
    <View key={item.id} style={[styles.slide, { width }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Feather name={item.icon} size={56} color="#fff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / onboardingData.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {onboardingData.length}
        </Text>
      </View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        {onboardingData.map((item, index) => renderSlide(item, index))}
      </View>

      {/* Navigation */}
      <View style={[styles.navigation, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.navigationButtons}>
          {/* Previous Button */}
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Feather name="arrow-left" size={20} color="#666" />
              <Text style={styles.previousText}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Skip Button */}
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Next/Get Started Button */}
          <TouchableOpacity 
            style={[
              styles.nextButton,
              { backgroundColor: onboardingData[currentIndex]?.color || '#4ECDC4' }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Feather 
              name={currentIndex === onboardingData.length - 1 ? 'check' : 'arrow-right'} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? onboardingData[currentIndex]?.color : '#E0E0E0',
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    textAlign: 'right',
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 32,
  },
  description: {
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  navigation: {
    paddingHorizontal: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previousText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginLeft: 4,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#999',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
