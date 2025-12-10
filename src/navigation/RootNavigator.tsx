import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import AuthNavigator from './AuthNavigator'; 
import TabNavigatorWithButton from './TabNavigatorWithButton';
import CreateRecipeScreen from '../screens/Recipe/CreateRecipeScreen';
import DietRestrictionStackNavigator from './DietRestrictionStackNavigator';
// ✅ IMPORT 2 SCREEN QUAN TRỌNG
import ViewRecipeScreen from '../screens/Recipe/ViewRecipeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ListFollowScreen from '../screens/Follow/ListFollowScreen';
import IngredientsScreen from '../screens/Ingredients/IngredientsScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
const RootStack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            if (token) {
                const decoded: any = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    await AsyncStorage.removeItem('userToken');
                    setIsLoggedIn(false);
                } else {
                    setIsLoggedIn(true);
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8BC34A" />
            </View>
        );
    }
    
    return (
        <NavigationContainer>
            <RootStack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName={isLoggedIn ? "MainAppTabs" : "AuthFlow"}
            >
                <RootStack.Screen 
                    name="AuthFlow" 
                    component={AuthNavigator} 
                />
                
                <RootStack.Screen 
                    name="MainAppTabs" 
                    component={TabNavigatorWithButton} 
                />

                <RootStack.Screen 
                    name="CreateRecipe" 
                    component={CreateRecipeScreen}
                    options={{
                        headerShown: false,
                        title: 'Tạo công thức mới',
                        headerStyle: {
                            backgroundColor: '#8BC34A',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                />

                <RootStack.Screen 
                    name="DietRestrictionFlow" 
                    component={DietRestrictionStackNavigator}
                />

                {/* ✅ SCREEN XEM CHI TIẾT CÔNG THỨC - DÙNG CHUNG CHO TẤT CẢ TAB */}
                <RootStack.Screen 
                    name="ViewRecipeScreen" 
                    component={ViewRecipeScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                    }}
                />

                {/* ✅ SCREEN XEM PROFILE NGƯỜI DÙNG - DÙNG CHUNG CHO TẤT CẢ TAB */}
                <RootStack.Screen 
                    name="ProfileScreen" 
                    component={ProfileScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                    }}
                />
                <RootStack.Screen 
                    name="ListFollowScreen" 
                    component={ListFollowScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                    }}
                />
                <RootStack.Screen 
                    name="IngredientsScreen" 
                    component={IngredientsScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                    }}
                />
                <RootStack.Screen 
                    name="NotificationScreen" 
                    component={NotificationScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                    }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default RootNavigator;
