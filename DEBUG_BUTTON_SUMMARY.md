# ✅ Debug Button Added to Settings

## What Was Added

### Debug Button in SettingsScreen
- **Location:** Bottom of settings list (only visible in development)
- **Function:** "Start Onboarding" 
- **Purpose:** Reset app state for testing in Expo Go

### Features

#### 1. Development-Only Visibility
```javascript
{__DEV__ && (
  <TouchableOpacity 
    style={[styles.settingItem, styles.debugButton]}
    onPress={handleStartOnboarding}
    activeOpacity={0.7}
  >
    // Debug button content
  </TouchableOpacity>
)}
```

#### 2. Reset Functionality
The button resets:
- ✅ **Premium Status** → `setPremiumStatus(false, null)`
- ✅ **Onboarding State** → `resetOnboarding()`
- ✅ **Navigation** → Returns to MainTabs (triggers onboarding flow)

#### 3. User-Friendly Confirmation
- **Confirmation Alert:** "This will reset the app's onboarding and premium state..."
- **Success Message:** "App state has been reset. Please restart the app..."
- **Error Handling:** Shows error if reset fails

#### 4. Visual Design
- **Red Theme:** Distinguishes it as a debug/development feature
- **Icon:** Refresh icon (`refresh-cw`) in red
- **Background:** Light red background (`#FFF5F5`)
- **Text:** Red color (`#FF6B6B`) with semi-bold font

### How It Works

1. **User taps "Start Onboarding"**
2. **Confirmation alert appears**
3. **User confirms reset**
4. **App state is cleared:**
   - Premium status → false
   - Onboarding status → reset
5. **Success message shown**
6. **Navigation returns to MainTabs**
7. **App detects onboarding needed and shows onboarding flow**

### Database Functions Used

- `setPremiumStatus(false, null)` - Clears premium status
- `resetOnboarding()` - Resets onboarding completion status

### Testing Benefits

- ✅ **Easy testing** of onboarding flow
- ✅ **Reset premium state** for payment testing
- ✅ **No need to reinstall app** in Expo Go
- ✅ **Quick iteration** during development
- ✅ **Only visible in development** (won't appear in production)

### Usage in Expo Go

1. Open app in Expo Go
2. Navigate to Settings
3. Scroll to bottom
4. Tap "Start Onboarding" (red button)
5. Confirm reset
6. App will restart onboarding flow

Perfect for testing the complete user journey from onboarding to premium! 🎉
