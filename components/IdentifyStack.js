import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import IdentifyScreen from '../screens/IdentifyScreen';

const Stack = createStackNavigator();

export default function IdentifyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="IdentifyMain" component={IdentifyScreen} />
    </Stack.Navigator>
  );
}
