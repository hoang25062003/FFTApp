// FILE: src/navigation/RootNavigator.tsx

import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator'; 
import TabNavigatorWithButton from './TabNavigatorWithButton';
import CreateRecipeScreen from '../screens/Recipe/CreateRecipeScreen';
import DietRestrictionStackNavigator from './DietRestrictionStackNavigator'; // ✅ IMPORT STACK NAVIGATOR

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
            setIsLoggedIn(!!token); 
        } catch (error) {
            console.error('Failed to check login status:', error);
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

                {/* ✅ MÀN HÌNH TẠO CÔNG THỨC */}
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

                {/* ✅ THAY THẾ: Sử dụng DietRestrictionStackNavigator thay vì màn hình đơn lẻ */}
                <RootStack.Screen 
                    name="DietRestrictionFlow" 
                    component={DietRestrictionStackNavigator}
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