import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MenuCameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState([]);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const insets = useSafeAreaInsets();

  const takePicture = async () => {
    if (capturedImages.length >= 3) {
      Alert.alert('Limit Reached', 'You can only take up to 3 photos');
      return;
    }

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        setCapturedImages(prev => [...prev, photo]);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const selectFromGallery = async () => {
    if (capturedImages.length >= 3) {
      Alert.alert('Limit Reached', 'You can only select up to 3 photos');
      return;
    }

    try {
      // Request gallery permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Gallery permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to select images for analysis.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      const remainingSlots = 3 - capturedImages.length;
      
      console.log('Opening gallery with remaining slots:', remainingSlots);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        base64: false,
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets) {
        console.log('Adding new images:', result.assets);
        // Clean and validate gallery images before adding
        const cleanAssets = result.assets.map(asset => ({
          uri: asset?.uri || '',
          width: asset?.width || 0,
          height: asset?.height || 0,
        })).filter(asset => asset.uri && asset.uri.trim() !== '');
        
        setCapturedImages(prev => [...prev, ...cleanAssets]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const removeImage = (indexToRemove) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const proceedToPreview = () => {
    if (capturedImages.length === 0) {
      Alert.alert('No Photos', 'Please take or select at least one photo to proceed.');
      return;
    }
    
    // Clean and validate image data before passing
    const cleanImages = capturedImages.map(image => ({
      uri: image?.uri || '',
      width: image?.width || 0,
      height: image?.height || 0,
    })).filter(image => image.uri && image.uri.trim() !== '');
    
    navigation.navigate('MenuImagePreview', { images: cleanImages });
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        {/* Header */}
        <View style={[styles.permissionHeader, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.permissionBackButton} onPress={goBack}>
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.permissionHeaderTitle}>Camera Access</Text>
          <View style={styles.permissionHeaderSpacer} />
        </View>

        {/* Content */}
        <View style={styles.permissionContent}>
          {/* Icon */}
          <View style={styles.permissionIconContainer}>
            <Feather name="camera" size={64} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          
          {/* Description */}
          <Text style={styles.permissionDescription}>
            To scan restaurant menus and find keto-friendly options, we need access to your camera. This helps us analyze menu items and provide compatibility ratings.
          </Text>

          {/* Features List */}
          <View style={styles.permissionFeatures}>
            <View style={styles.permissionFeature}>
              <Feather name="check" size={20} color="#4CAF50" />
              <Text style={styles.permissionFeatureText}>Scan up to 3 menu photos</Text>
            </View>
            <View style={styles.permissionFeature}>
              <Feather name="check" size={20} color="#4CAF50" />
              <Text style={styles.permissionFeatureText}>Select from gallery</Text>
            </View>
            <View style={styles.permissionFeature}>
              <Feather name="check" size={20} color="#4CAF50" />
              <Text style={styles.permissionFeatureText}>Get keto compatibility ratings</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={[styles.permissionButtons, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.permissionPrimaryButton} onPress={requestPermission}>
            <Feather name="camera" size={20} color="#fff" />
            <Text style={styles.permissionPrimaryButtonText}>Allow Camera Access</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.permissionSecondaryButton} onPress={goBack}>
            <Text style={styles.permissionSecondaryButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Menu</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Camera Controls */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 30 }]}>
          {/* Captured Images Preview */}
          {capturedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {capturedImages.map((image, index) => (
                <View key={index} style={styles.imagePreviewCard}>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
          )}

          <View style={styles.controlRow}>
            {/* Gallery Button */}
            <TouchableOpacity style={styles.galleryButton} onPress={selectFromGallery}>
              <View style={styles.galleryIconContainer}>
                <Feather name="image" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            {/* Flip Camera Button */}
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={() => setFacing(
                facing === 'back' 
                  ? 'front' 
                  : 'back'
              )}
            >
              <Feather name="refresh-cw" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Proceed Button */}
          {capturedImages.length > 0 && (
            <TouchableOpacity style={styles.proceedButton} onPress={proceedToPreview}>
              <Text style={styles.proceedButtonText}>
                Continue ({capturedImages.length}/3)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  permissionBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
  },
  permissionHeaderSpacer: {
    width: 40,
  },
  permissionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  permissionFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  permissionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  permissionFeatureText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  permissionButtons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  permissionPrimaryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  permissionPrimaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  permissionSecondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionSecondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 20,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  imagePreviewCard: {
    position: 'relative',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#000',
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  message: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
});
