import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Keto Diet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is the Ketogenic Diet?</Text>
            <Text style={styles.sectionText}>
              The ketogenic diet is a high-fat, adequate-protein, low-carbohydrate diet that forces the body to burn fats rather than carbohydrates for energy. This metabolic state is called ketosis, where the liver converts fat into ketones, which become the primary energy source for the brain and body.
            </Text>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Ketosis Works</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Feather name="zap" size={20} color="#FF6B35" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Normal Metabolism</Text>
                  <Text style={styles.infoDescription}>
                    Typically, your body uses glucose (from carbs) as its primary fuel source. When you eat carbs, your blood sugar rises, and insulin helps store excess glucose as glycogen.
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Feather name="trending-down" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Carb Restriction</Text>
                  <Text style={styles.infoDescription}>
                    By limiting carbs to 20-50g per day, your body depletes its glycogen stores within 2-4 days, forcing it to find alternative energy sources.
                  </Text>
                </View>
              </View>
              
              <View style={[styles.infoItem, { marginBottom: 0 }]}>
                <View style={styles.infoIcon}>
                  <Feather name="activity" size={20} color="#45B7D1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Ketone Production</Text>
                  <Text style={styles.infoDescription}>
                    The liver begins converting stored fat into ketones (acetoacetate, beta-hydroxybutyrate, and acetone), which become your brain and body's new fuel.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Macronutrient Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
            <View style={styles.macroCard}>
              <View style={styles.macroItem}>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, { backgroundColor: '#FF6B35', width: '75%' }]} />
                </View>
                <Text style={styles.macroLabel}>Fat: 70-80%</Text>
                <Text style={styles.macroDescription}>Primary energy source</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, { backgroundColor: '#4ECDC4', width: '20%' }]} />
                </View>
                <Text style={styles.macroLabel}>Protein: 15-25%</Text>
                <Text style={styles.macroDescription}>Muscle preservation</Text>
              </View>
              
              <View style={[styles.macroItem, { marginBottom: 0 }]}>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBar, { backgroundColor: '#45B7D1', width: '7.5%' }]} />
                </View>
                <Text style={styles.macroLabel}>Carbs: 5-10%</Text>
                <Text style={styles.macroDescription}>Minimal intake</Text>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Potential Benefits</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <Feather name="target" size={24} color="#FF6B35" />
                <Text style={styles.benefitTitle}>Weight Loss</Text>
                <Text style={styles.benefitDescription}>
                  Rapid initial weight loss due to water loss and fat burning
                </Text>
              </View>
              
              <View style={styles.benefitCard}>
                <Feather name="cpu" size={24} color="#4ECDC4" />
                <Text style={styles.benefitTitle}>Mental Clarity</Text>
                <Text style={styles.benefitDescription}>
                  Stable energy levels and improved cognitive function
                </Text>
              </View>
              
              <View style={styles.benefitCard}>
                <Feather name="heart" size={24} color="#45B7D1" />
                <Text style={styles.benefitTitle}>Blood Sugar</Text>
                <Text style={styles.benefitDescription}>
                  Improved insulin sensitivity and blood glucose control
                </Text>
              </View>
              
              <View style={styles.benefitCard}>
                <Feather name="battery" size={24} color="#96CEB4" />
                <Text style={styles.benefitTitle}>Energy Stability</Text>
                <Text style={styles.benefitDescription}>
                  Reduced energy crashes and hunger fluctuations
                </Text>
              </View>
            </View>
          </View>

          {/* Foods to Eat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foods to Eat</Text>
            <View style={styles.foodCategories}>
              <View style={styles.foodCategory}>
                <Text style={styles.foodCategoryTitle}>🥩 Proteins</Text>
                <Text style={styles.foodList}>
                  Beef, pork, lamb, chicken, turkey, fish, seafood, eggs
                </Text>
              </View>
              
              <View style={styles.foodCategory}>
                <Text style={styles.foodCategoryTitle}>🥑 Fats</Text>
                <Text style={styles.foodList}>
                  Avocado, olive oil, coconut oil, butter, ghee, nuts, seeds
                </Text>
              </View>
              
              <View style={styles.foodCategory}>
                <Text style={styles.foodCategoryTitle}>🥬 Vegetables</Text>
                <Text style={styles.foodList}>
                  Leafy greens, broccoli, cauliflower, zucchini, bell peppers
                </Text>
              </View>
              
              <View style={[styles.foodCategory, { marginBottom: 0 }]}>
                <Text style={styles.foodCategoryTitle}>🧀 Dairy</Text>
                <Text style={styles.foodList}>
                  Cheese, cream, full-fat yogurt (in moderation)
                </Text>
              </View>
            </View>
          </View>

          {/* Foods to Avoid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foods to Avoid</Text>
            <View style={styles.avoidCard}>
              <View style={styles.avoidItem}>
                <Feather name="x-circle" size={20} color="#FF6B35" />
                <Text style={styles.avoidText}>Grains (bread, rice, pasta)</Text>
              </View>
              <View style={styles.avoidItem}>
                <Feather name="x-circle" size={20} color="#FF6B35" />
                <Text style={styles.avoidText}>Sugars and sweets</Text>
              </View>
              <View style={styles.avoidItem}>
                <Feather name="x-circle" size={20} color="#FF6B35" />
                <Text style={styles.avoidText}>Most fruits (high sugar)</Text>
              </View>
              <View style={styles.avoidItem}>
                <Feather name="x-circle" size={20} color="#FF6B35" />
                <Text style={styles.avoidText}>Starchy vegetables</Text>
              </View>
              <View style={[styles.avoidItem, { marginBottom: 0 }]}>
                <Feather name="x-circle" size={20} color="#FF6B35" />
                <Text style={styles.avoidText}>Legumes and beans</Text>
              </View>
            </View>
          </View>

          {/* Side Effects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Side Effects</Text>
            <View style={styles.warningCard}>
              <View style={styles.warningItem}>
                <Feather name="alert-triangle" size={20} color="#FFA500" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Keto Flu</Text>
                  <Text style={styles.warningDescription}>
                    Headaches, fatigue, nausea, and brain fog during the first week
                  </Text>
                </View>
              </View>
              
              <View style={styles.warningItem}>
                <Feather name="droplet" size={20} color="#FFA500" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Dehydration</Text>
                  <Text style={styles.warningDescription}>
                    Increased water loss requires more fluid and electrolyte intake
                  </Text>
                </View>
              </View>
              
              <View style={[styles.warningItem, { marginBottom: 0 }]}>
                <Feather name="wind" size={20} color="#FFA500" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Digestive Changes</Text>
                  <Text style={styles.warningDescription}>
                    Constipation or diarrhea as your body adapts to new foods
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips for Success */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips for Success</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>1</Text>
                </View>
                <Text style={styles.tipText}>
                  Start gradually by reducing carbs over a few days
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>2</Text>
                </View>
                <Text style={styles.tipText}>
                  Stay hydrated and supplement electrolytes (sodium, potassium, magnesium)
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>3</Text>
                </View>
                <Text style={styles.tipText}>
                  Plan meals and snacks to avoid carb-heavy temptations
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>4</Text>
                </View>
                <Text style={styles.tipText}>
                  Track your macros to ensure you're staying in ketosis
                </Text>
              </View>
              
              <View style={[styles.tipItem, { marginBottom: 0 }]}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>5</Text>
                </View>
                <Text style={styles.tipText}>
                  Be patient - it takes 2-4 weeks to become fully fat-adapted
                </Text>
              </View>
            </View>
          </View>

          {/* Important Disclaimer */}
          <View style={styles.section}>
            <View style={styles.disclaimerCard}>
              <Feather name="alert-circle" size={24} color="#FF6B35" />
              <View style={styles.disclaimerContent}>
                <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
                <Text style={styles.disclaimerText}>
                  The ketogenic diet is not suitable for everyone. Consult with a healthcare provider before starting, especially if you have diabetes, heart disease, or other medical conditions. This information is for educational purposes only and should not replace professional medical advice.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#3C3C43',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  macroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  macroItem: {
    marginBottom: 16,
  },
  macroBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  macroDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  foodCategories: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  foodCategory: {
    marginBottom: 20,
  },
  foodCategoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  foodList: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  avoidCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avoidText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginLeft: 12,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
    marginLeft: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  tipsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipNumberText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3C3C43',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
    flexDirection: 'row',
  },
  disclaimerContent: {
    flex: 1,
    marginLeft: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#C53030',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#742A2A',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
