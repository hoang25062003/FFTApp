import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Hoặc MaterialIcons

// Import các màn hình của bạn
import HomeScreen from '../screens/HomePage/HomeSreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import AddScreen from '../screens/Add/AddScreen';
import ScanScreen from '../screens/Scan/ScanScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen'; // Hoặc màn hình profile thực tế của bạn

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false, // Ẩn header mặc định cho từng màn hình tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let iconColor = focused ? '#8BC34A' : '#777'; // Màu xanh lá cây khi focus

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Add':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline'; // Hoặc chỉ 'plus'
              break;
            case 'Scan':
              iconName = focused ? 'qrcode-scan' : 'qrcode'; // Hoặc 'camera-outline'
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle'; // Fallback icon
          }

          // Icon 'Thêm' có thể khác nếu bạn muốn dấu + lớn hơn
          if (route.name === 'Add') {
             // Sử dụng một icon khác hoặc tùy chỉnh kích thước, màu sắc ở đây nếu cần
             return <Icon name="plus-circle" size={size + 10} color={iconColor} />; // Ví dụ: to hơn
          }

          return <Icon name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: '#8BC34A', // Màu chữ khi tab được chọn
        tabBarInactiveTintColor: '#777',   // Màu chữ khi tab không được chọn
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          height: 60, // Chiều cao của thanh tab
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: 'Yêu thích' }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ tabBarLabel: 'Thêm' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: 'Quét' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;