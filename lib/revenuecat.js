import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/revenuecat';

// Track initialization state to prevent multiple initializations
let isInitialized = false;

// Initialize RevenueCat
export const initializeRevenueCat = async () => {
  try {
    // If already initialized, return true
    if (isInitialized) {
      console.log('RevenueCat already initialized, skipping...');
      return true;
    }
    
    const platform = Platform.OS;
    const apiKey = REVENUECAT_CONFIG[platform]?.apiKey;
    
    if (!apiKey || apiKey.includes('xxxxxxxx')) {
      console.warn('RevenueCat API key not configured, using fallback mode');
      return false;
    }

    // Add timeout to prevent hanging
    const initPromise = Purchases.configure({ apiKey });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('RevenueCat initialization timeout')), 10000)
    );
    
    await Promise.race([initPromise, timeoutPromise]);
    isInitialized = true;
    console.log('RevenueCat initialized successfully');
    
    // Set user attributes if needed
    try {
      await Purchases.setAttributes({
        '$appVersion': '1.0.0',
      });
    } catch (attrError) {
      console.warn('Failed to set user attributes:', attrError);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    isInitialized = false; // Reset on error
    return false;
  }
};

// Get available offerings
export const getOfferings = async () => {
  try {
    if (!isInitialized) {
      console.warn('RevenueCat not initialized, cannot fetch offerings');
      return null;
    }
    
    const offeringsPromise = Purchases.getOfferings();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Offerings fetch timeout')), 5000)
    );
    
    const offerings = await Promise.race([offeringsPromise, timeoutPromise]);
    console.log('Available offerings:', offerings);
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    // Return null to trigger fallback pricing
    return null;
  }
};

// Get current customer info
export const getCustomerInfo = async () => {
  try {
    if (!isInitialized) {
      console.warn('RevenueCat not initialized, cannot fetch customer info');
      return null;
    }
    
    const customerPromise = Purchases.getCustomerInfo();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Customer info fetch timeout')), 5000)
    );
    
    const customerInfo = await Promise.race([customerPromise, timeoutPromise]);
    console.log('Customer info:', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase) => {
  try {
    console.log('Attempting to purchase package:', packageToPurchase.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('Purchase successful:', customerInfo);
    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Purchase failed:', error);
    
    if (error.userCancelled) {
      return {
        success: false,
        error: 'Purchase was cancelled',
        userCancelled: true,
      };
    }
    
    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    console.log('Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    
    console.log('Purchases restored:', customerInfo);
    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return {
      success: false,
      error: error.message || 'Failed to restore purchases',
    };
  }
};

// Check if user has active subscription
export const hasActiveSubscription = (customerInfo) => {
  if (!customerInfo) return false;
  
  // Check if user has the premium entitlement active
  const premiumEntitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId];
  return premiumEntitlement && premiumEntitlement.isActive;
};

// Get subscription status
export const getSubscriptionStatus = (customerInfo) => {
  if (!customerInfo) return 'unknown';
  
  const premiumEntitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementId];
  
  if (premiumEntitlement && premiumEntitlement.isActive) {
    return 'active';
  }
  
  const allEntitlements = customerInfo.entitlements.all[REVENUECAT_CONFIG.entitlementId];
  if (allEntitlements && !allEntitlements.isActive) {
    return 'expired';
  }
  
  return 'none';
};
