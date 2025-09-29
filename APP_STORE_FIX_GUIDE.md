# App Store Review Fix Guide

## Issue Summary
Your app was rejected due to in-app purchase bugs. The main issue is that when users tap the subscription button, the app shows a "Purchase Failed" error message.

## Root Cause Analysis
The rejection is specifically about **receipt validation**. Apple requires that your server can handle production-signed apps getting receipts from Apple's test environment.

## Solutions Implemented

### 1. Server-Side Receipt Validation ✅
- Created `/supabase/functions/ketometer-receipt-validation/index.ts`
- Implements Apple's recommended approach:
  1. First validates against production App Store
  2. If fails with "Sandbox receipt used in production", retries against sandbox
- Handles all Apple receipt validation status codes
- Updates user premium status in database

### 2. Enhanced Error Handling ✅
- Improved PaymentScreen.js error handling
- Better logging for debugging
- Graceful fallback when RevenueCat offerings aren't available
- More descriptive error messages

### 3. RevenueCat Configuration ✅
- Verified iOS API key is properly configured
- Added server-side validation function
- Improved package finding logic

## Deployment Steps

### Step 1: Deploy Receipt Validation Function
```bash
# Make sure you're in the project directory
cd /Users/jonah/Development/KetoMeter

# Deploy the new edge function
./deploy-receipt-validation.sh
```

### Step 2: Set Environment Variables
```bash
# Set your App Store Shared Secret (optional but recommended)
supabase secrets set APP_STORE_SHARED_SECRET=your_shared_secret_here
```

### Step 3: Verify RevenueCat Setup
1. **Check RevenueCat Dashboard:**
   - Go to [RevenueCat Dashboard](https://app.revenuecat.com)
   - Verify your iOS app is configured with bundle ID: `com.prtcl10.ketometer`
   - Ensure products `ketometer_yearly` and `ketometer_weekly` are created
   - Verify entitlement `entl510ad6fffb` is configured

2. **Check App Store Connect:**
   - Verify subscriptions are approved and ready for sale
   - Ensure Paid Apps Agreement is accepted
   - Check that banking and tax information is complete

### Step 4: Test the Fix
1. **Test in Sandbox:**
   - Use sandbox Apple ID for testing
   - Test both yearly and weekly subscriptions
   - Verify purchases work without errors

2. **Test Receipt Validation:**
   - Check server logs for validation attempts
   - Verify both production and sandbox validation paths work

## Key Changes Made

### PaymentScreen.js
- Enhanced error handling for missing offerings
- Better package finding logic with detailed logging
- Improved error messages for debugging
- Added server-side validation integration

### lib/revenuecat.js
- Added `validateReceiptWithServer()` function
- Integrated with Supabase edge function

### New Edge Function
- `/supabase/functions/ketometer-receipt-validation/index.ts`
- Handles Apple's receipt validation requirements
- Supports both production and sandbox environments
- Updates user premium status in database

## Testing Checklist

Before resubmitting to App Store:

- [ ] RevenueCat offerings load successfully
- [ ] Both yearly and weekly subscriptions can be purchased
- [ ] No "Purchase Failed" errors appear
- [ ] Receipt validation works in both environments
- [ ] User premium status updates correctly
- [ ] Restore purchases functionality works
- [ ] Error handling is graceful

## Common Issues and Solutions

### Issue: "Unable to load subscription options"
**Solution:** Check RevenueCat configuration and internet connection

### Issue: "Selected subscription plan not found"
**Solution:** Verify product IDs match between RevenueCat and App Store Connect

### Issue: Receipt validation fails
**Solution:** Check server logs and ensure environment variables are set

## Next Steps

1. **Deploy the fixes** using the deployment script
2. **Test thoroughly** in sandbox environment
3. **Resubmit to App Store** with detailed notes about the fixes
4. **Monitor** server logs during review process

## Additional Recommendations

1. **Enable Debug Logging:**
   ```javascript
   import Purchases from 'react-native-purchases';
   Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
   ```

2. **Monitor Server Logs:**
   - Check Supabase function logs during testing
   - Monitor receipt validation attempts

3. **Test on Physical Devices:**
   - iOS Simulator doesn't support in-app purchases
   - Always test on real devices

## Support Resources

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Apple In-App Purchase Guide](https://developer.apple.com/documentation/storekit)
- [Receipt Validation Guide](https://developer.apple.com/documentation/appstorereceipts/validating_receipts_with_the_app_store)

---

**Important:** The main fix is the server-side receipt validation that handles both production and sandbox environments. This addresses Apple's specific requirement mentioned in the review.
