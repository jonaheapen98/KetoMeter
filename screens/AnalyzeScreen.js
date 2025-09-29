import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzeFood } from '../lib/supabase';
import { saveAnalysis, isUserPremium } from '../lib/database';

export default function AnalyzeScreen({ navigation, route }) {
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [slowProgressInterval, setSlowProgressInterval] = useState(null);
  const insets = useSafeAreaInsets();
  
  // Check if we have images or just text analysis
  const images = route?.params?.images;
  const additionalDescription = route?.params?.additionalDescription;
  const foodDescription = route?.params?.foodDescription;
  
  // Check if this is menu analysis based on inputType parameter
  const isMenuAnalysis = route?.params?.inputType === 'menu';

  useEffect(() => {
    checkPremiumAndAnalyze();
  }, []);

  const checkPremiumAndAnalyze = async () => {
    try {
      // Check if user is premium locally first (fast check)
      const isPremium = await isUserPremium();
      
      if (!isPremium) {
        // User is not premium locally, show loader for a bit, then redirect to payment
        startProgressAnimation();
        setTimeout(() => {
          navigation.navigate('Payment');
        }, 3000); // Show loader for 3 seconds
        return;
      }
      
      // User appears to be premium locally, proceed with analysis immediately
      console.log('User appears premium locally, proceeding with analysis');
      startProgressAnimation();
      
      // Start the actual analysis
      if (images && images.length > 0) {
        performImageAnalysis();
      } else if (foodDescription) {
        performTextAnalysis();
      }
      
      // Background sync to validate subscription (non-blocking)
      backgroundValidateSubscription();
      
    } catch (error) {
      console.error('Error checking premium status:', error);
      // If error checking premium, show loader then payment wall
      startProgressAnimation();
      setTimeout(() => {
        navigation.navigate('Payment');
      }, 3000);
    }
  };

  // Background validation of subscription (non-blocking)
  const backgroundValidateSubscription = async () => {
    try {
      // Import RevenueCat functions dynamically to avoid blocking
      const { initializeRevenueCat, getCustomerInfo, hasActiveSubscription } = await import('../lib/revenuecat');
      const { setPremiumStatus } = await import('../lib/database');
      
      const initialized = await initializeRevenueCat();
      if (!initialized) return;
      
      const customerInfo = await getCustomerInfo();
      if (!customerInfo) return;
      
      const hasActive = hasActiveSubscription(customerInfo);
      const localStatus = await isUserPremium();
      
      if (!hasActive && localStatus) {
        // Subscription expired, update local status
        console.log('Background validation: Subscription expired, updating local status');
        await setPremiumStatus(false, 'expired', null);
      } else if (hasActive && !localStatus) {
        // Subscription active, restore premium
        console.log('Background validation: Subscription active, restoring premium');
        await setPremiumStatus(true, 'restored', null);
      }
    } catch (error) {
      console.error('Background subscription validation error:', error);
      // Don't throw error - this is background validation
    }
  };

  const startProgressAnimation = () => {
    // Animate from 0 to 78% over 3-4 seconds
    const fastInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 78) {
          clearInterval(fastInterval);
          // Start slow progress from 78% onwards
          startSlowProgress();
          return 78;
        }
        return prev + 1; // Increase by 1% every 50ms
      });
    }, 50);
  };

  const startSlowProgress = () => {
    // Increment by 1% every 3 seconds from 78% onwards
    const slowInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) {
          clearInterval(slowInterval);
          return 99; // Stop at 99% until response comes
        }
        return prev + 1;
      });
    }, 3000); // 3 seconds
    
    setSlowProgressInterval(slowInterval);
  };

  const completeAnalysis = async (analysis) => {
    // Clear the slow progress interval
    if (slowProgressInterval) {
      clearInterval(slowProgressInterval);
      setSlowProgressInterval(null);
    }
    
    try {
      // Save analysis to database
      const analysisType = isMenuAnalysis ? 'menu' : 'image';
      const inputData = images ? {
        images: images,
        additionalDescription: additionalDescription
      } : {
        foodDescription: foodDescription
      };
      
      await saveAnalysis(analysisType, inputData, analysis);
      console.log('Analysis saved to database');
    } catch (error) {
      console.error('Error saving analysis to database:', error);
      // Continue to report screen even if saving fails
    }
    
    // Quickly animate to 100%
    animateTo100(() => {
      const reportScreen = isMenuAnalysis ? 'MenuReport' : 'Report';
      navigation.navigate(reportScreen, { analysis });
    });
  };

  const animateTo100 = (onComplete) => {
    // Quickly count up to 100% in 0.5 seconds
    const quickInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(quickInterval);
          setTimeout(onComplete, 300); // Small delay before navigation
          return 100;
        }
        return prev + 1; // Increase by 1% every 50ms for quick animation
      });
    }, 50);
  };

  const performImageAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Convert images to base64 for the API
      const imageData = await Promise.all(
        images.map(async (image) => {
          try {
            // Convert image URI to base64
            const response = await fetch(image.uri);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                resolve({
                  uri: image.uri,
                  base64: base64,
                  type: blob.type || 'image/jpeg'
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.error('Error converting image to base64:', error);
            return {
              uri: image.uri,
              base64: null,
              type: 'image/jpeg'
            };
          }
        })
      );

      // Call the edge function with images and optional text
      const content = additionalDescription || 'Please analyze the food images provided';
      const analysis = await analyzeFood(isMenuAnalysis ? 'menu' : 'image', content, imageData);
      
      // Complete the analysis (jump to 100% and navigate)
      completeAnalysis(analysis);
      
    } catch (error) {
      console.error('Image analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze images. Please try again.');
      navigation.goBack();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performTextAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Call the edge function for text analysis
      const analysis = await analyzeFood('text', foodDescription.trim());
      
      // Complete the analysis (jump to 100% and navigate)
      completeAnalysis(analysis);
      
    } catch (error) {
      console.error('Text analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze text. Please try again.');
      navigation.goBack();
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Content */}
      <View style={styles.content}>
        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Heading and Subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>Analyze</Text>
          <Text style={styles.headerSubtitle}>Processing your food description...</Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.loaderContainer}>
          <View style={styles.loader}>
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
            <View style={styles.loaderDot} />
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
});
