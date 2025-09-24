import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

// Helper function for dynamic colors based on keto score (same as ReportScreen)
const getKetoScoreColor = (score) => {
  if (score >= 80) return '#2E7D32'; // Dark green - Excellent keto
  if (score >= 60) return '#FF9800'; // Orange - Moderate keto
  if (score >= 40) return '#FF5722'; // Red-orange - Poor keto
  if (score >= 20) return '#F44336'; // Red - Anti-keto
  return '#D32F2F'; // Dark red - Very anti-keto
};

import { 
  getAllAnalysisHistory, 
  deleteAnalysis, 
  clearAllHistory,
  getAnalysisTypeInfo,
  formatDate 
} from '../lib/database';

export default function HistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const historyData = await getAllAnalysisHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleItemPress = (item) => {
    const reportScreen = item.analysisType === 'menu' ? 'MenuReport' : 'Report';
    navigation.navigate(reportScreen, { 
      analysis: item.analysisResult,
      analysisId: item.id,
      fromHistory: true 
    });
  };


  const handleClearAll = () => {
    if (history.length === 0) return;
    
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all analysis history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              loadHistory();
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          }
        }
      ]
    );
  };

  const renderHistoryItem = ({ item }) => {
    const typeInfo = getAnalysisTypeInfo(item.analysisType);
    
    // Handle different display logic for menu vs individual food analysis
    let displayTitle, displayScore, displaySummary, itemCount, images;
    
    if (item.analysisType === 'menu') {
      try {
        const analysisResult = JSON.parse(item.analysis_result || '{}');
        itemCount = analysisResult.compatibilitySections?.reduce((total, section) => 
          total + (section.items?.length || 0), 0) || 0;
        displayTitle = 'Menu Scan';
        displayScore = null; // No score for menu
        displaySummary = item.summary || 'Menu analysis completed';
        images = item.inputData?.images || [];
      } catch (error) {
        console.error('Error parsing menu analysis result:', error);
        displayTitle = 'Menu Scan';
        displayScore = null;
        itemCount = 0;
        displaySummary = item.summary || 'Menu analysis completed';
        images = item.inputData?.images || [];
      }
    } else {
      displayTitle = item.dishName || 'Untitled Analysis';
      displayScore = item.ketoScore;
      itemCount = null;
      displaySummary = item.summary || 'No summary available.';
      images = item.inputData?.images || [];
    }
    
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          {/* Text Content */}
          <View style={styles.textSection}>
            <View style={styles.textHeader}>
              <Text style={styles.dishName} numberOfLines={1}>
                {displayTitle}
              </Text>
            </View>
            
            <View style={styles.timestampRow}>
              {displayScore !== null && (
                <View style={[styles.scoreBadge, { backgroundColor: getKetoScoreColor(displayScore) }]}>
                  <Text style={styles.scoreText}>{displayScore}/100</Text>
                </View>
              )}
              <Text style={styles.timestamp}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            
            <Text style={styles.summary} numberOfLines={2}>
              {displaySummary}
            </Text>
          </View>
          
          {/* Right Side - Image */}
          {images && images.length > 0 && (
            <View style={styles.imageSection}>
              <Image
                source={{ uri: images[0].uri }}
                style={styles.mainImage}
                contentFit="cover"
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather name="clock" size={48} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No Analysis History</Text>
      <Text style={styles.emptyDescription}>
        Your analysis history will appear here after you analyze food items.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={[styles.listContainer, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Analysis History</Text>
          </View>
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  listHeader: {
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: '#F2F2F6',
    fontFamily: 'Inter_800Bold',
  },
  listTitle: {
    fontSize: 32,
    fontFamily: 'Inter_800Bold',
    color: '#000',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
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
  itemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageSection: {
    width: 80,
    height: 80,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  textSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dishName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.1,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  summary: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3C3C43',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingTop: 120,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
});