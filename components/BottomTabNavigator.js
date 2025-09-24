import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import IdentifyStack from './IdentifyStack';
import HistoryScreen from '../screens/HistoryScreen';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Identify') {
            iconName = 'maximize';
          } else if (route.name === 'History') {
            iconName = 'list';
          }

          return <Feather name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.5)',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E5EA',
          borderTopWidth: 1,
          paddingBottom: 0,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter_500Medium',
        },
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomColor: '#E5E5EA',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontFamily: 'Inter_600SemiBold',
          color: '#333',
        },
      })}
    >
      <Tab.Screen 
        name="Identify" 
        component={IdentifyStack}
        options={{ 
          headerShown: false 
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
