import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IdentifyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.getParent()?.navigate('Settings')}
        >
          <Feather name="settings" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleBold}>keto</Text>
          <Text style={styles.headerTitleLight}>meter</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.getParent()?.navigate('Info')}
        >
          <Feather name="info" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card 1 */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate('TypeFood')}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Type and describe your food</Text>
              <Text style={styles.cardDescription}>Quickly type or paste what you're about to eat</Text>
            </View>
            <View style={styles.cardImage}>
              <Image 
                source={require('../assets/Images/Identify/Type.png')} 
                style={styles.cardImageContent}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 2 */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate('Camera')}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Snap food or nutrition label</Text>
              <Text style={styles.cardDescription}>Snap food or nutrition label</Text>
            </View>
            <View style={styles.cardImage}>
              <Image 
                source={require('../assets/Images/Identify/Snap.png')} 
                style={styles.cardImageContent}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 3 */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate('MenuCamera')}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Scan from a menu</Text>
              <Text style={styles.cardDescription}>Point your camera at a restaurant menu to find keto friendly items</Text>
            </View>
            <View style={styles.cardImage}>
              <Image 
                source={require('../assets/Images/Identify/Menu.png')} 
                style={styles.cardImageContent}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleBold: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  headerTitleLight: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'start',
    padding: 20,
    paddingRight: 0,
  },
  cardText: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  cardImage: {
    width: 140,
    height: 145,
  },
  cardImageContent: {
    width: 140,
    height: 145,
  },
});
