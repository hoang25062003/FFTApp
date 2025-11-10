// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// // PHẢI CÓ: import useFonts để tải font
// import { useFonts } from 'expo-font'; 

// import AuthNavigator from './src/navigation/AuthNavigator'; // Import bộ điều hướng mới
// import { NavigationContainer } from '@react-navigation/native'; // Cần NavigationContainer

// const App = () => {
//   // Lỗi: Đã sửa đường dẫn font để đảm bảo chính xác (giả sử thư mục Fonts là F in hoa)
//   const [fontsLoaded] = useFonts({
//     'Ionicons': require('./src/assets/Fonts/Ionicons.ttf'), 
//     'FontAwesome': require('./src/assets/Fonts/FontAwesome.ttf'), 
//     // Nếu bạn có font tùy chỉnh khác, hãy thêm vào đây
//   });

//   // Màn hình chờ: Bắt buộc phải chờ font tải xong trước khi render giao diện chính
//   if (!fontsLoaded) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Đang tải tài nguyên...</Text>
//       </View>
//     );
//   }

//   // SỬA: Thay vì render LoginScreen trực tiếp, chúng ta dùng NavigationContainer
//   // và AuthNavigator để bật tính năng điều hướng (navigate)
//   return (
//     <NavigationContainer>
//       <AuthNavigator />
//     </NavigationContainer>
//   );
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default App;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font'; 
import { NavigationContainer } from '@react-navigation/native';

// SỬA: Thay thế AuthNavigator bằng TabNavigator để vào Trang chủ ngay
import TabNavigator from './src/navigation/TabNavigator'; 

const App = () => {
  // Tải font: Đảm bảo đường dẫn chính xác
  const [fontsLoaded] = useFonts({
    'Ionicons': require('./src/assets/Fonts/Ionicons.ttf'), 
    'FontAwesome': require('./src/assets/Fonts/FontAwesome.ttf'), 
    // Thêm font tùy chỉnh khác nếu có
  });

  // Màn hình chờ: Bắt buộc phải chờ font tải xong
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải tài nguyên...</Text>
      </View>
    );
  }

  // THAY ĐỔI: Render TabNavigator trực tiếp
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;