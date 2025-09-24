import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
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
    image: null,
    isSpecialPage: true
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

export default function OnboardingScreen({ navigation, onComplete }) {
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
      
      // Trigger parent component to re-check onboarding status
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still trigger completion even if database update fails
      if (onComplete) {
        onComplete();
      }
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


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Back Button and Dots */}
      <View style={styles.header}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={styles.topBackButton}
              onPress={handlePrevious}
            >
              <Feather name="arrow-left" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Dots Indicator - Always Centered */}
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
        
        {/* Spacer for back button alignment */}
        <View style={styles.backButtonContainer} />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        style={styles.slidesContainer}
      >
        {onboardingData.map((item, index) => (
          <ScrollView
            key={item.id}
            style={[styles.slide, { width }]}
            contentContainerStyle={item.isSpecialPage ? styles.specialSlideContent : styles.slideContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={item.isSpecialPage ? styles.specialContent : styles.content}>
              {item.isSpecialPage ? (
                // Special layout for page 2
                <>
                  {/* Title */}
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>

                  {/* Visual Cards */}
                  <View style={styles.challengeCards}>
                    <View style={styles.challengeCard}>
                      <View style={styles.challengeIconContainer}>
                        <Feather name="eye-off" size={24} color="#FF6B35" />
                      </View>
                      <Text style={styles.challengeTitle}>Hidden Ingredients</Text>
                      <Text style={styles.challengeDescription}>
                        Sugars and starches lurk in unexpected places
                      </Text>
                    </View>

                    <View style={styles.challengeCard}>
                      <View style={styles.challengeIconContainer}>
                        <Feather name="coffee" size={24} color="#FF6B35" />
                      </View>
                      <Text style={styles.challengeTitle}>Restaurant Meals</Text>
                      <Text style={styles.challengeDescription}>
                        Unknown ingredients in dining out
                      </Text>
                    </View>

                    <View style={styles.challengeCard}>
                      <View style={styles.challengeIconContainer}>
                        <Feather name="package" size={24} color="#FF6B35" />
                      </View>
                      <Text style={styles.challengeTitle}>Packaged Foods</Text>
                      <Text style={styles.challengeDescription}>
                        Misleading "healthy" labels hide carbs
                      </Text>
                    </View>

                    <View style={styles.challengeCard}>
                      <View style={styles.challengeIconContainer}>
                        <Feather name="alert-triangle" size={24} color="#FF6B35" />
                      </View>
                      <Text style={styles.challengeTitle}>Progress Derailed</Text>
                      <Text style={styles.challengeDescription}>
                        One wrong ingredient can break ketosis
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                // Standard layout for other pages
                <>
                  {/* Single Icon for Current Page */}
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Feather name={item.icon} size={56} color="#fff" />
                  </View>

                  {/* Title */}
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>

                  {/* Description */}
                  <Text style={styles.description}>{item.description}</Text>
                </>
              )}
            </View>
          </ScrollView>
        ))}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { paddingBottom: insets.bottom + 20 }]}>
        {/* Full Width Next/Get Started Button */}
        <TouchableOpacity 
          style={[
            styles.fullWidthButton,
            { backgroundColor: '#000000' }
          ]}
          onPress={handleNext}
        >
          <Text style={styles.fullWidthButtonText}>
            {currentIndex === 0 ? 'Get Started' : 
             currentIndex === onboardingData.length - 1 ? "Let's Begin" : 'Next'}
          </Text>
          <Feather 
            name={currentIndex === 0 ? 'arrow-right' : 
                  currentIndex === onboardingData.length - 1 ? 'check' : 'arrow-right'} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  specialSlideContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
    flex: 1,
  },
  specialContent: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    flex: 1,
    paddingTop: 20,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  overlappingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidthButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  challengeCards: {
    width: '100%',
    marginTop: 24,
    paddingBottom: 20,
    alignSelf: 'stretch',
  },
  challengeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
    flex: 1,
  },
  challengeDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
});
