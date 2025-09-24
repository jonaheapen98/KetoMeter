import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/revenuecat';

// Initialize RevenueCat
export const initializeRevenueCat = async () => {
  try {
    const platform = Platform.OS;
    const apiKey = REVENUECAT_CONFIG[platform]?.apiKey;
    
    if (!apiKey) {
      throw new Error(`RevenueCat API key not found for platform: ${platform}`);
    }

    await Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
    
    // Set user attributes if needed
    await Purchases.setAttributes({
      '$appVersion': '1.0.0',
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    return false;
  }
};

// Get available offerings
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    console.log('Available offerings:', offerings);
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

// Get current customer info
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
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
  
  // Check if user has any active entitlements
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  return activeEntitlements.length > 0;
};

// Get subscription status
export const getSubscriptionStatus = (customerInfo) => {
  if (!customerInfo) return 'unknown';
  
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  
  if (activeEntitlements.length > 0) {
    return 'active';
  }
  
  const expiredEntitlements = Object.values(customerInfo.entitlements.all)
    .filter(entitlement => entitlement.isActive === false);
  
  if (expiredEntitlements.length > 0) {
    return 'expired';
  }
  
  return 'none';
};
