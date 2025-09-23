import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper functions for dynamic colors based on keto score
const getKetoScoreColor = (score) => {
  if (score >= 80) return '#2E7D32'; // Dark green - Excellent keto
  if (score >= 60) return '#4CAF50'; // Green - Good keto
  if (score >= 40) return '#FF9800'; // Orange - Moderate keto
  if (score >= 20) return '#FF5722'; // Red-orange - Poor keto
  return '#F44336'; // Red - Anti-keto
};

const getProgressBarColor = (score) => {
  return '#000000'; // Always black
};

export default function ReportScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const analysis = route?.params?.analysis;

  const handleClose = () => {
    // Check if we came from history
    if (route?.params?.fromHistory) {
      navigation.goBack();
    } else {
      // Navigate back to the main tabs
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Close Button */}
      <TouchableOpacity 
        style={[styles.floatingCloseButton, { top: insets.top + 20 }]}
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
        {/* Dynamic Keto Score Card */}
        <View style={[
          styles.ketoScoreCard, 
          { backgroundColor: getKetoScoreColor(analysis?.ketoScore || 0) }
        ]}>
          {/* Tick Image Placeholder */}
          <View style={styles.tickImageContainer}>
            <View style={styles.tickImagePlaceholder}>
              <Feather name="check" size={40} color="#fff" />
            </View>
          </View>

          {/* Dish Name */}
          <Text style={styles.dishName}>{analysis?.dishName || 'Food Analysis'}</Text>

          {/* Divider Line */}
          <View style={styles.divider} />

          {/* Keto Score Section */}
          <Text style={styles.ketoScoreHeading}>Keto Score</Text>
          <Text style={styles.ketoScoreNumber}>{analysis?.ketoScore || 0}/100</Text>
          <Text style={styles.ketoScoreComment}>{analysis?.scoreComment || 'Analysis in progress...'}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[
                styles.progressBarFill, 
                { 
                  width: `${analysis?.ketoScore || 0}%`,
                  backgroundColor: getProgressBarColor(analysis?.ketoScore || 0)
                }
              ]} />
            </View>
          </View>
        </View>


        {/* Food Breakdown */}
        {analysis?.breakdown?.summary && (
          <>
            <Text style={styles.sectionTitle}>Food Breakdown</Text>
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownText}>{analysis.breakdown.summary}</Text>
            </View>
          </>
        )}

        {/* Nutrition Visual Grid */}
        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        <Text style={styles.sectionSubtitle}>{analysis?.nutritionSnapshot?.servingSize || 'per serving'}</Text>
        <View style={styles.nutritionGrid}>
          {analysis?.nutritionSnapshot && (
            <>
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionIcon}>
                  <Feather name="zap" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.nutritionCardLabel}>Calories</Text>
                <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.calories}</Text>
              </View>
              
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionIcon}>
                  <Feather name="activity" size={20} color="#FF9800" />
                </View>
                <Text style={styles.nutritionCardLabel}>Net Carbs</Text>
                <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.netCarbs}</Text>
              </View>
              
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionIcon}>
                  <Feather name="droplet" size={20} color="#4ECDC4" />
                </View>
                <Text style={styles.nutritionCardLabel}>Protein</Text>
                <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.protein}</Text>
              </View>
              
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionIcon}>
                  <Feather name="layers" size={20} color="#45B7D1" />
                </View>
                <Text style={styles.nutritionCardLabel}>Fat</Text>
                <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.fat}</Text>
              </View>
              
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionIcon}>
                  <Feather name="layers" size={20} color="#96CEB4" />
                </View>
                <Text style={styles.nutritionCardLabel}>Fiber</Text>
                <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.fiber}</Text>
              </View>
              
              {analysis.nutritionSnapshot.sugar && (
                <View style={styles.nutritionCard}>
                  <View style={styles.nutritionIcon}>
                    <Feather name="heart" size={20} color="#E91E63" />
                  </View>
                  <Text style={styles.nutritionCardLabel}>Sugar</Text>
                  <Text style={styles.nutritionCardValue}>{analysis.nutritionSnapshot.sugar}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Metabolic Insights */}
        {analysis?.metabolicAnalysis && (
          <>
            <Text style={styles.sectionTitle}>Metabolic Insights</Text>
            <View style={styles.insightsListCard}>
              <View style={styles.insightListItem}>
                <View style={styles.insightIconContainer}>
                  <Feather name="activity" size={24} color="#FF9800" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Insulin Impact</Text>
                  <Text style={styles.insightDescription}>{analysis.metabolicAnalysis.insulinImpact}</Text>
                </View>
              </View>
              
              <View style={styles.insightListItem}>
                <View style={styles.insightIconContainer}>
                  <Feather name="target" size={24} color="#4CAF50" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Keto Compatibility</Text>
                  <Text style={styles.insightDescription}>{analysis.metabolicAnalysis.ketoCompatibility}</Text>
                </View>
              </View>
              
              <View style={styles.insightListItem}>
                <View style={styles.insightIconContainer}>
                  <Feather name="smile" size={24} color="#2196F3" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Satiety Factor</Text>
                  <Text style={styles.insightDescription}>{analysis.metabolicAnalysis.satietyFactor}</Text>
                </View>
              </View>
              
              <View style={styles.insightListItem}>
                <View style={styles.insightIconContainer}>
                  <Feather name="star" size={24} color="#9C27B0" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Nutrient Density</Text>
                  <Text style={styles.insightDescription}>{analysis.metabolicAnalysis.nutrientDensity}</Text>
                </View>
              </View>
            </View>
          </>
        )}


        {/* Health Insights */}
        {analysis?.healthNotes && analysis.healthNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            <View style={styles.healthCard}>
              {analysis.healthNotes.slice(0, 3).map((note, index) => (
                <View key={index} style={styles.healthInsight}>
                  <View style={styles.healthBullet} />
                  <Text style={styles.healthInsightText}>{note}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Detailed Serving Advice */}
        {analysis?.servingAdvice && analysis.servingAdvice.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Serving & Swap Advice</Text>
            <View style={styles.adviceCard}>
              {analysis.servingAdvice.map((advice, index) => (
                <View key={index} style={styles.adviceItem}>
                  <View style={styles.adviceContent}>
                    <Text style={styles.adviceText}>{advice.text}</Text>
                    {advice.impact && (
                      <Text style={styles.adviceImpact}>{advice.impact}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F6',
  },
  floatingCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  ketoScoreCard: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tickImageContainer: {
    marginBottom: 20,
  },
  tickImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  dishName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 24,
  },
  ketoScoreHeading: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ketoScoreNumber: {
    fontSize: 48,
    fontFamily: 'Inter_800Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  ketoScoreComment: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
      bottomText: {
        fontSize: 17,
        fontFamily: 'Inter_400Regular',
        color: 'rgba(0, 0, 0, 0.8)',
        lineHeight: 26,
        textAlign: 'left',
        marginBottom: 32,
      },
      summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 4,
      },
      summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      },
      summaryTitle: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
      },
      summaryValue: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
      },
      breakdownGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
      },
      breakdownCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      breakdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      breakdownCardTitle: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        marginLeft: 8,
        flex: 1,
      },
      breakdownCardText: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
      },
      breakdownStatus: {
        alignItems: 'flex-start',
      },
      breakdownStatusTextGreen: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#4CAF50',
      },
      breakdownStatusTextYellow: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#FF9800',
      },
      breakdownStatusTextRed: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#F44336',
      },
      nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
      },
      nutritionCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      nutritionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      },
      nutritionCardLabel: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
      },
      nutritionCardValue: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
      },
      insightsListCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      insightListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      insightIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      },
      insightContent: {
        flex: 1,
        flexShrink: 1,
      },
      insightTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        marginBottom: 4,
      },
      insightDescription: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        lineHeight: 20,
        flexWrap: 'wrap',
        flex: 1,
      },
      healthCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      healthInsight: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
      },
      healthBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginTop: 6,
        marginRight: 12,
      },
      healthInsightText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#1A1A1A',
        lineHeight: 20,
        flex: 1,
      },
      adviceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      adviceItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      adviceIconGreen: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 2,
        shadowColor: '#4CAF50',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      adviceIconYellow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFC107',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 2,
        shadowColor: '#FFC107',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      adviceIconRed: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F44336',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 2,
        shadowColor: '#F44336',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      adviceContent: {
        flex: 1,
      },
      adviceText: {
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
        color: '#1A1A1A',
        lineHeight: 22,
        marginBottom: 4,
      },
      adviceImpact: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        fontStyle: 'italic',
      },
      breakdownCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      breakdownText: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#1A1A1A',
        lineHeight: 24,
        textAlign: 'left',
      },
      insightsListCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
      insightListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      insightListLabel: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        flex: 1,
      },
      insightListValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
        lineHeight: 20,
      },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  breakdownItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  breakdownLabel: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  breakdownValue: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIconYellow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#FFC107',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIconRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTextGreen: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#4CAF50',
    letterSpacing: 0.2,
  },
  statusTextYellow: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF9800',
    letterSpacing: 0.2,
  },
  statusTextRed: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#F44336',
    letterSpacing: 0.2,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  nutritionLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    flex: 1,
    letterSpacing: 0.2,
  },
  nutritionValue: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    flex: 2,
    textAlign: 'right',
    letterSpacing: 0.1,
  },
  healthNoteItem: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  healthNoteText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  boldText: {
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 4,
  },
  adviceIconGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  adviceIconRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
      adviceText: {
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
        color: '#1A1A1A',
        lineHeight: 22,
        flex: 1,
        letterSpacing: 0.1,
      },
      adviceContent: {
        flex: 1,
      },
      adviceImpact: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
      },
      breakdownImpact: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
      },
      metabolicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      metabolicLabel: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        flex: 1,
        letterSpacing: 0.2,
      },
      metabolicValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
        lineHeight: 20,
      },
      adviceIconYellow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFC107',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        marginTop: 2,
        shadowColor: '#FFC107',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
      },
      macroItem: {
        alignItems: 'center',
        flex: 1,
      },
      macroLabel: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      macroValue: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1A1A1A',
      },
      macroAnalysisItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      macroAnalysisLabel: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        flex: 1,
      },
      macroAnalysisValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
      },
      contextItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      contextLabel: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        flex: 1,
      },
      contextValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
        lineHeight: 20,
      },
      optimizationGroup: {
        marginBottom: 20,
      },
      optimizationTitle: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
        letterSpacing: 0.2,
      },
      optimizationTip: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        lineHeight: 20,
        marginBottom: 4,
        paddingLeft: 8,
      },
      factorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
      },
      factorLabel: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: '#1A1A1A',
        flex: 1,
      },
      factorValue: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
        lineHeight: 20,
      },
});
