import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import Icon from 'react-native-vector-icons/Ionicons'; 
import { View, Text, StyleSheet } from 'react-native'; 
 
import HomeScreen from '../screens/HomePage/HomeScreen'; 
import ScanScreen from '../screens/Scan/ScanScreen'; 
import HealthGoalStackNavigator from './HealthGoalStackNavigator'; 
import ProfileStackNavigator from './ProfileStackNavigator'; 
 import ScanStackNavigator from './ScanStackNavigator';
import HealthMetricStackNavigator from './HealthMetricStackNavigator';


const Tab = createBottomTabNavigator(); 

 
const TabNavigator: React.FC = () => { 
  const insets = useSafeAreaInsets(); 
 
  return ( 
    <Tab.Navigator 
      initialRouteName="Home" 
      screenOptions={({ route }) => ({ 
        headerShown: false, 
        tabBarIcon: ({ focused, color, size }) => { 
          let iconName: string; 
          let iconColor = focused ? '#8BC34A' : '#777'; 
 
          // Nút Scan đặc biệt với background tròn
          if (route.name === 'Scan') {
            return (
              <View style={styles.scanButtonContainer}>
                <View style={[
                  styles.scanButton,
                  focused ? styles.scanButtonActive : styles.scanButtonInactive
                ]}>
                  <Icon name="scan" size={28} color="#fff" />
                </View>
              </View>
            );
          }

          switch (route.name) { 
            case 'Home': 
              iconName = focused ? 'home' : 'home-outline'; 
              break; 
            case 'Goal': 
              iconName = focused ? 'trophy' : 'trophy-outline'; 
              break; 
            case 'Health': 
              iconName = focused ? 'fitness' : 'fitness-outline'; 
              break; 
            case 'Profile': 
              iconName = focused ? 'person' : 'person-outline'; 
              break; 
            default: 
              iconName = 'ellipse'; 
          } 
 
          return <Icon name={iconName} size={size} color={iconColor} />; 
        }, 
        tabBarActiveTintColor: '#8BC34A', 
        tabBarInactiveTintColor: '#777', 
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: 'bold', 
        }, 
        tabBarStyle: { 
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom, 
          paddingTop: 5, 
          backgroundColor: '#fff', 
          borderTopWidth: 1, 
          borderTopColor: '#eee', 
        }, 
      })} 
    > 
      <Tab.Screen  
        name="Home"  
        component={HomeScreen}  
        options={{ tabBarLabel: 'Trang chủ' }}  
      /> 
       
      <Tab.Screen  
        name="Goal"  
        component={HealthGoalStackNavigator} 
        options={{ tabBarLabel: 'Mục tiêu' }}  
      /> 
 
      <Tab.Screen  
        name="Scan"  
        component={ScanStackNavigator}  
        options={{ 
          tabBarLabel: '',
          tabBarIconStyle: { marginTop: 10 },
          // tabBarLabelStyle: { 
          //   fontSize: 12, 
          //   fontWeight: 'bold',
          //   marginTop: 10
          // }
        }}  
      /> 
 
      <Tab.Screen  
        name="Health"  
        component={HealthMetricStackNavigator} 
        options={{ tabBarLabel: 'Sức khỏe' }}  
      /> 
 
      <Tab.Screen  
        name="Profile"  
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: 'Hồ sơ' }}  
      /> 
    </Tab.Navigator> 
  ); 
}; 
 
const styles = StyleSheet.create({ 
  placeholderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
  }, 
  placeholderText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 20, 
  }, 
  placeholderSubtext: { 
    fontSize: 16, 
    color: '#777', 
    marginTop: 10, 
  },
  scanButtonContainer: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#8BC34A',
    shadowColor: '#8BC34A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
    transform: [{ scale: 1.05 }],
  },
  scanButtonInactive: {
    backgroundColor: '#A5D6A7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
}); 
 
export default TabNavigator;