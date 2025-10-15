import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import GrievanceScreen from '../screens/GrievanceScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';
import CompaniesListScreen from '../screens/CompaniesListScreen';
import CompanyProfileScreen from '../screens/CompanyProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HomeFeedScreen from '../screens/HomeFeed';
import StoryViewScreen from '../screens/StoryView';
import GraveyardScreen from '../screens/GraveyardScreen';
import DailyBriefScreen from '../screens/DailyBriefScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4ECDC4',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Posts" 
      component={HomeFeedScreen} 
      options={({ navigation }) => ({
        title: 'TexhPulze',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={{
              backgroundColor: '#27AE60',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              marginRight: 10,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
              ✍️ Create
            </Text>
          </TouchableOpacity>
        ),
      })}
    />
    <Stack.Screen 
      name="CreatePost" 
      component={CreatePostScreen} 
      options={{ title: 'Create Post' }}
    />
    <Stack.Screen 
      name="PostDetails" 
      component={PostDetailsScreen} 
      options={{ title: 'Post Details' }}
    />
    <Stack.Screen 
      name="StoryView" 
      component={StoryViewScreen} 
      options={{ title: 'Story' }}
    />
  </Stack.Navigator>
);

// Companies Stack Navigator
const CompaniesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4ECDC4',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="CompaniesList" 
      component={CompaniesListScreen} 
      options={{ title: 'Companies' }}
    />
    <Stack.Screen 
      name="CompanyProfile" 
      component={CompanyProfileScreen} 
      options={{ title: 'Company Profile' }}
    />
  </Stack.Navigator>
);

// Stories Stack Navigator
const StoriesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4ECDC4',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Stories" 
      component={CommunityScreen} 
      options={{ title: 'Stories' }}
    />
    <Stack.Screen 
      name="Grievance" 
      component={GrievanceScreen} 
      options={{ title: 'Report Grievance' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Companies') {
          iconName = focused ? 'business' : 'business-outline';
        } else if (route.name === 'Stories') {
          iconName = focused ? 'newspaper' : 'newspaper-outline';
        } else if (route.name === 'Graveyard') {
          iconName = focused ? 'skull' : 'skull-outline';
        } else if (route.name === 'DailyBrief') {
          iconName = focused ? 'headset' : 'headset-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4ECDC4',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#e0e0e0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Companies" component={CompaniesStack} />
    <Tab.Screen name="Stories" component={StoriesStack} />
    <Tab.Screen name="Graveyard" component={GraveyardScreen} />
    <Tab.Screen name="DailyBrief" component={DailyBriefScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();

  return <MainTabNavigator />;
};

export default AppNavigator;
