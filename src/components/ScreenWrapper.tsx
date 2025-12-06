// src/components/ScreenWrapper.tsx

import React from 'react';
import { StyleSheet, ViewStyle, ScrollView, ScrollViewProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropsWithChildren } from 'react';

// Định nghĩa Props cho component
interface ScreenWrapperProps {
  style?: ViewStyle; // Cho phép tùy chỉnh style của container chính
  scrollable?: boolean; // Tùy chọn: nếu màn hình cần cuộn
  scrollViewProps?: ScrollViewProps; // Tùy chọn: props bổ sung cho ScrollView
}

const ScreenWrapper: React.FC<PropsWithChildren<ScreenWrapperProps>> = ({ 
  children, 
  style, 
  scrollable = false, 
  scrollViewProps 
}) => {
  const containerStyle: ViewStyle = { 
    flex: 1, 
    backgroundColor: '#fff', // Màu nền mặc định
    ...style 
  };

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle}>
        <ScrollView 
          // Chỉ cần áp dụng padding ngang trong ScrollView
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {/* Container thường để áp dụng padding ngang hoặc flex layout */}
      <View style={styles.nonScrollContent}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Style cho nội dung KHÔNG cuộn
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 20, // Ví dụ: áp dụng padding ngang chung
  },
  // Style cho nội dung CUỘN (contentContainerStyle)
  scrollContent: {
    paddingHorizontal: 20, // Ví dụ: áp dụng padding ngang chung
    paddingBottom: 20, // Thêm padding dưới nếu cần thiết
    flexGrow: 1, // Quan trọng để ScrollView hoạt động đúng cách
  },
});

export default ScreenWrapper;