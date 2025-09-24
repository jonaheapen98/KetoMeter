# RevenueCat Integration Setup

This guide will help you set up RevenueCat integration for the KetoMeter app.

## Prerequisites

1. **App Store Connect** - Your app must be configured with in-app purchases
2. **RevenueCat Account** - Sign up at [app.revenuecat.com](https://app.revenuecat.com)

## Step 1: Configure RevenueCat Dashboard

### 1.1 Create a New Project
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Click "Create Project"
3. Enter project name: "KetoMeter"
4. Select your team (if applicable)

### 1.2 Add Your App
1. Go to "Apps" section
2. Click "Add App"
3. **iOS App:**
   - Bundle ID: `com.prtcl10.ketometer`
   - App Store Connect App ID: `6752915803`
4. **Android App:** (when ready)
   - Package Name: `com.prtcl10.ketometer`
   - Google Play Console App ID: (to be added later)

### 1.3 Configure Products
1. Go to "Products" section
2. Click "Add Product"
3. Add these products (must match your App Store Connect subscriptions):
   - **Product ID:** `ketometer_yearly`
     - **Type:** Subscription
     - **Duration:** 1 year
   - **Product ID:** `ketometer_weekly`
     - **Type:** Subscription
     - **Duration:** 1 week

### 1.4 Create Entitlement
1. Go to "Entitlements" section
2. Click "Add Entitlement"
3. **Identifier:** `premium`
4. Attach both products (`ketometer_yearly` and `ketometer_weekly`) to this entitlement

### 1.5 Get API Keys
1. Go to "Project Settings" > "API Keys"
2. Copy your iOS API key (starts with `appl_`)
3. Copy your Android API key (starts with `goog_`) when ready

## Step 2: Update Configuration

### 2.1 Update API Keys
Edit `config/revenuecat.js` and replace the placeholder API keys:

```javascript
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: 'appl_YOUR_ACTUAL_IOS_API_KEY_HERE',
    bundleId: 'com.prtcl10.ketometer',
  },
  android: {
    apiKey: 'goog_YOUR_ACTUAL_ANDROID_API_KEY_HERE',
    packageName: 'com.prtcl10.ketometer',
  },
  // ... rest of config
};
```

### 2.2 Verify Product IDs
Make sure the product IDs in `config/revenuecat.js` match exactly what you configured in:
- App Store Connect
- RevenueCat Dashboard

## Step 3: Test the Integration

### 3.1 Test in Development
1. Build and run your app
2. Navigate to the payment screen
3. Check console logs for RevenueCat initialization
4. Test purchase flow (use sandbox testing)

### 3.2 Test Purchases
1. **iOS:** Use sandbox Apple ID for testing
2. **Android:** Use test accounts in Google Play Console
3. Verify purchases appear in RevenueCat dashboard

## Step 4: Production Setup

### 4.1 App Store Connect
1. Ensure your subscriptions are approved
2. Set up pricing for all regions
3. Configure subscription groups properly

### 4.2 RevenueCat Production
1. Switch to production mode in RevenueCat dashboard
2. Verify all products are synced
3. Test with real purchases (small amounts)

## Troubleshooting

### Common Issues

1. **"No offerings found"**
   - Check if products are properly configured in RevenueCat
   - Verify product IDs match exactly
   - Ensure products are attached to an entitlement

2. **"Purchase failed"**
   - Check if subscriptions are approved in App Store Connect
   - Verify you're using sandbox accounts for testing
   - Check RevenueCat logs for detailed error messages

3. **"API key invalid"**
   - Double-check API keys in `config/revenuecat.js`
   - Ensure you're using the correct platform key (iOS vs Android)

### Debug Mode
Enable debug logging by adding this to your app initialization:

```javascript
import Purchases from 'react-native-purchases';

// Enable debug logs
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
```

## Support

- **RevenueCat Docs:** [docs.revenuecat.com](https://docs.revenuecat.com)
- **RevenueCat Support:** [support.revenuecat.com](https://support.revenuecat.com)
- **App Store Connect:** [developer.apple.com](https://developer.apple.com)

## Next Steps

1. Complete the RevenueCat dashboard setup
2. Update API keys in the config file
3. Test the integration thoroughly
4. Deploy to production when ready

The payment screen will now dynamically load pricing from RevenueCat and handle real purchases!
