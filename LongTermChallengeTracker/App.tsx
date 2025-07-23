import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import PianoScreen from './src/screens/PianoScreen';
import StretchScreen from './src/screens/StretchScreen';
import DjScreen from './src/screens/DjScreen';
import PointsDetailScreen from './src/screens/PointsDetailScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import { RootStackParamList, RootTabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Stack navigators for each tab
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PointsDetail" component={PointsDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="Piano" component={PianoScreen} />
      <Stack.Screen name="Stretch" component={StretchScreen} />
      <Stack.Screen name="Dj" component={DjScreen} />
    </Stack.Navigator>
  );
};

const WorkoutStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Workout" component={WorkoutScreen} />
    </Stack.Navigator>
  );
};

const PianoStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Piano" component={PianoScreen} />
    </Stack.Navigator>
  );
};

const StretchStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Stretch" component={StretchScreen} />
    </Stack.Navigator>
  );
};

const DjStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F5F5' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dj" component={DjScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'WorkoutTab') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'PianoTab') {
              iconName = focused ? 'musical-notes' : 'musical-notes-outline';
            } else if (route.name === 'StretchTab') {
              iconName = focused ? 'body' : 'body-outline';
            } else if (route.name === 'DjTab') {
              iconName = focused ? 'disc' : 'disc-outline';
            }

            // @ts-ignore: Ionicons typings issue
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            paddingTop: 5,
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack} 
          options={{ tabBarLabel: 'ホーム' }}
        />
        <Tab.Screen 
          name="WorkoutTab" 
          component={WorkoutStack} 
          options={{ tabBarLabel: '筋トレ' }}
        />
        <Tab.Screen 
          name="PianoTab" 
          component={PianoStack} 
          options={{ tabBarLabel: 'ピアノ' }}
        />
        <Tab.Screen 
          name="StretchTab" 
          component={StretchStack} 
          options={{ tabBarLabel: 'ストレッチ' }}
        />
        <Tab.Screen 
          name="DjTab" 
          component={DjStack} 
          options={{ tabBarLabel: 'DJ' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
