import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function MenuImagePreviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { images = [] } = route?.params || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [additionalDescription, setAdditionalDescription] = useState('');
  const scrollViewRef = React.useRef();

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentImageIndex(index);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    scrollViewRef.current.scrollTo({ x: index * screenWidth, animated: true });
  };

  const handleAnalyze = () => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      Alert.alert('No Images', 'Please go back and capture or select images to analyze.');
      return;
    }
    navigation.navigate('MenuAnalyze', { images, additionalDescription });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: (insets?.top || 0) + 10 }]}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Review Menu Photos</Text>
        </View>
        <View style={styles.headerIcon} /> {/* Spacer */}
      </View>

      {/* Image Slider */}
      <View style={styles.imageSliderContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScrollView}
        >
          {images && Array.isArray(images) && images.map((image, index) => (
            <View key={index} style={styles.imageSlide}>
              <Image
                source={{ uri: image?.uri || '' }}
                style={styles.fullImage}
                contentFit="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.imageCounterContainer}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{images?.length || 0}
          </Text>
        </View>
      </View>

      {/* Thumbnails */}
      <View style={styles.thumbnailContainer}>
        {images && Array.isArray(images) && images.map((image, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => goToImage(index)}
            style={[
              styles.thumbnail, 
              index === currentImageIndex && styles.thumbnailSelected
            ]}
          >
            <Image
              source={{ uri: image?.uri || '' }}
              style={styles.thumbnailImage}
              contentFit="cover"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional Description */}
      <ScrollView style={styles.descriptionScrollView}>
        <Text style={styles.descriptionLabel}>Optional: Any specific dietary preferences or restrictions?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 'Looking for low-carb options' or 'Avoid dairy'"
          placeholderTextColor="#999"
          multiline
          value={additionalDescription}
          onChangeText={setAdditionalDescription}
        />
      </ScrollView>

      {/* Analyze Button */}
      <View style={[styles.buttonContainer, { paddingBottom: (insets?.bottom || 0) + 20 }]}>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
        >
          <Text style={styles.analyzeButtonText}>Analyze Menu</Text>
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
    color: '#1A1A1A',
  },
  imageSliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  imageScrollView: {
    width: screenWidth,
  },
  imageSlide: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imageCounterContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imageCounterText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  descriptionScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  textInput: {
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F2F2F6',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
