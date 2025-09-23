import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MenuReportScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const analysis = route?.params?.analysis;
  const [expandedCards, setExpandedCards] = useState({});

  const handleClose = () => {
    // Check if we came from history
    if (route?.params?.fromHistory) {
      navigation.goBack();
    } else {
      // Navigate back to the main tabs
      navigation.navigate('MainTabs');
    }
  };

  const toggleCard = (sectionIndex, itemIndex) => {
    const cardId = `${sectionIndex}-${itemIndex}`;
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Helper function to get compatibility color
  const getCompatibilityColor = (level) => {
    switch (level.toLowerCase()) {
      case 'highly compatible':
      case 'excellent':
        return '#4CAF50'; // Green
      case 'moderately compatible':
      case 'good':
        return '#FF9800'; // Orange
      case 'less compatible':
      case 'moderate':
        return '#FF5722'; // Red-orange
      case 'not compatible':
      case 'poor':
        return '#F44336'; // Red
      default:
        return '#4CAF50';
    }
  };

  // Helper function to get compatibility icon
  const getCompatibilityIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'highly compatible':
      case 'excellent':
        return 'check-circle';
      case 'moderately compatible':
      case 'good':
        return 'alert-circle';
      case 'less compatible':
      case 'moderate':
        return 'x-circle';
      case 'not compatible':
      case 'poor':
        return 'x';
      default:
        return 'check-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity 
        style={[styles.closeButton, { top: insets.top + 20 }]}
        onPress={handleClose}
      >
        <View style={styles.closeButtonContainer}>
          <Feather name="x" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu Analysis</Text>
          <Text style={styles.headerSubtitle}>Keto compatibility ratings for menu items</Text>
        </View>

        {/* Compatibility Sections - Only show sections with items */}
        {analysis?.compatibilitySections?.filter(section => 
          section.items && section.items.length > 0
        ).map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <View style={[
                  styles.sectionIconContainer,
                  { backgroundColor: getCompatibilityColor(section.level) }
                ]}>
                  <Feather 
                    name={getCompatibilityIcon(section.level)} 
                    size={18} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.sectionTitle}>{section.level}</Text>
              </View>
            </View>

            {/* Items in this compatibility level */}
            {section.items?.map((item, itemIndex) => {
              const cardId = `${sectionIndex}-${itemIndex}`;
              const isExpanded = expandedCards[cardId];
              
              return (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={styles.itemCard}
                  onPress={() => toggleCard(sectionIndex, itemIndex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.headerRight}>
                      <View style={[
                        styles.compatibilityBadge,
                        { backgroundColor: getCompatibilityColor(section.level) }
                      ]}>
                        <Text style={styles.compatibilityBadgeText}>
                          {item.ketoScore || 'N/A'}/100
                        </Text>
                      </View>
                      <Feather 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#666" 
                        style={styles.expandIcon}
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.itemReasoning} numberOfLines={isExpanded ? undefined : 2}>
                    {item.reasoning}
                  </Text>
                  
                  {isExpanded && (
                    <>
                      {/* Additional details if available */}
                      {item.nutrition && (
                        <View style={styles.nutritionDetails}>
                          <View style={styles.nutritionRow}>
                            <Text style={styles.nutritionText}>Calories: {item.nutrition.calories}</Text>
                            <Text style={styles.nutritionText}>Net Carbs: {item.nutrition.netCarbs}</Text>
                          </View>
                        </View>
                      )}

                      {/* Modifications if available */}
                      {item.modifications && item.modifications.length > 0 && (
                        <View style={styles.modificationsContainer}>
                          <Text style={styles.modificationsLabel}>Suggested Modifications:</Text>
                          {item.modifications.map((mod, modIndex) => (
                            <View key={modIndex} style={styles.modificationItem}>
                              <Feather name="edit-3" size={14} color="#666" />
                              <Text style={styles.modificationText}>{mod}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Summary Section - Only show if summary exists and is not empty */}
        {analysis?.summary && analysis.summary.trim().length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Menu Summary</Text>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        )}

        {/* Tips Section - Only show if tips exist and have content */}
        {analysis?.tips && analysis.tips.length > 0 && analysis.tips.some(tip => tip && tip.trim().length > 0) && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>General Tips</Text>
            {analysis.tips.filter(tip => tip && tip.trim().length > 0).map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Feather name="sun" size={16} color="#FF9800" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
  },
  closeButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 8,
  },
  compatibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compatibilityBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  itemReasoning: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 0,
    letterSpacing: 0.05,
  },
  nutritionDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  nutritionLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutritionText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A1A',
    flex: 1,
    minWidth: '45%',
    letterSpacing: 0.1,
  },
  modificationsContainer: {
    marginTop: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  modificationsLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#E65100',
    marginBottom: 8,
    letterSpacing: -0.05,
  },
  modificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  modificationText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    letterSpacing: 0.05,
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#4A4A4A',
    lineHeight: 22,
    letterSpacing: 0.05,
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipsTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#4A4A4A',
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
    letterSpacing: 0.05,
  },
});
