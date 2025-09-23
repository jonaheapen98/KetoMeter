import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AnalyzeScreen({ navigation }) {
  const [progress, setProgress] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate progress from 0% to 100% over 3 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to Report screen after reaching 100%
          setTimeout(() => {
            navigation.navigate('Report');
          }, 500);
          return 100;
        }
        return prev + 2; // Increase by 2% every 60ms
      });
    }, 60);

    return () => clearInterval(interval);
  }, [navigation]);

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
