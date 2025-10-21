import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import GrievanceScreen from '../screens/GrievanceScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
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
        component={HomeScreen} 
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
        name="Community" 
        component={CommunityScreen} 
        options={{ title: 'Community' }}
      />
      <Stack.Screen 
        name="Grievance" 
        component={GrievanceScreen} 
        options={{ title: 'Report Grievance' }}
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
