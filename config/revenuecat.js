// RevenueCat Configuration
// Replace these with your actual API keys from RevenueCat dashboard

export const REVENUECAT_CONFIG = {
  // Get these from RevenueCat Dashboard > Project Settings > API Keys
  ios: {
    apiKey: 'appl_pTGTlCFTvvemzBAwfIOUNeYUaNc', // iOS API key
    bundleId: 'com.prtcl10.ketometer', // Your app's bundle ID
  },
  android: {
    apiKey: 'goog_xxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Android API key
    packageName: 'com.prtcl10.ketometer', // Your app's package name
  },
  
  // App Store Connect Product IDs (must match what you configured in App Store Connect)
  productIds: {
    yearly: 'ketometer_yearly', // Must match your App Store Connect subscription
    weekly: 'ketometer_weekly', // Must match your App Store Connect subscription
  },
  
  // Entitlement identifier (configure this in RevenueCat dashboard)
  entitlementId: 'premium', // This should match your RevenueCat entitlement identifier
};

// Instructions for setup:
// 1. Go to RevenueCat Dashboard (https://app.revenuecat.com)
// 2. Create a new project or select existing
// 3. Go to Project Settings > API Keys
// 4. Copy your iOS and Android API keys
// 5. Replace the placeholder keys above
// 6. Go to Products and create products with the same identifiers as your App Store Connect subscriptions
// 7. Create an entitlement called "premium" and attach your products to it
// 8. Make sure your App Store Connect subscriptions are approved and ready for sale
