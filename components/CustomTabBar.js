import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar(props) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ backgroundColor: '#fff' }}>
      <BottomTabBar {...props} />
      <View style={{ height: insets.bottom, backgroundColor: '#fff' }} />
    </View>
  );
}
