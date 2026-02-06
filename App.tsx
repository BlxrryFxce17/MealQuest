import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import FavoritesScreen from './src/screens/FavoriteScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
  RecipeDetail: { idMeal: string; strMeal: string };
};

export type DrawerParamList = {
  Recipes: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const ONBOARD_KEY = 'mealquest:onboarded';

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Recipes"
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: { backgroundColor: '#020617', width: 260 },
        drawerActiveTintColor: '#f97316',
        drawerInactiveTintColor: '#e5e7eb',
      }}
    >
      <Drawer.Screen
        name="Recipes"
        component={RecipeListScreen}
        options={{ title: 'Recipes' }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [checkingOnboard, setCheckingOnboard] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboard = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARD_KEY);
        if (!value) {
          setShowOnboarding(true);
        }
      } finally {
        setCheckingOnboard(false);
      }
    };
    checkOnboard();
  }, []);

  if (checkingOnboard) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={showOnboarding ? 'Onboarding' : 'Login'}>
        {showOnboarding && (
          <Stack.Screen name="Onboarding">
            {props => (
              <OnboardingScreen
                {...props}
                onDone={async () => {
                  await AsyncStorage.setItem(ONBOARD_KEY, '1');
                  setShowOnboarding(false);
                }}
              />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainDrawer} />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={({ route }) => ({ title: route.params.strMeal })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
