import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

import IdentifyScreen from './screens/IdentifyScreen';
import HistoryScreen from './screens/HistoryScreen';
import LearnScreen from './screens/LearnScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Identify') {
              iconName = 'scan';
            } else if (route.name === 'History') {
              iconName = 'list';
            } else if (route.name === 'Learn') {
              iconName = 'book-open';
            }

            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E5E5EA',
            borderTopWidth: 1,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomColor: '#E5E5EA',
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#333',
          },
        })}
      >
        <Tab.Screen 
          name="Identify" 
          component={IdentifyScreen}
          options={{ title: 'Identify' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'History' }}
        />
        <Tab.Screen 
          name="Learn" 
          component={LearnScreen}
          options={{ title: 'Learn' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
