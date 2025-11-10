// FILE: babel.config.js

module.exports = function(api) {
  api.cache(true); // Tối ưu hóa hiệu suất bằng cách lưu cache
  return {
    // Preset bắt buộc cho các dự án Expo
    presets: ['babel-preset-expo'], 
    
    plugins: [
      // 🚨 CẤU HÌNH SỬA LỖI: module:react-native-dotenv
      // Plugin này cho phép bạn import các biến từ file .env bằng '@env'
      ['module:react-native-dotenv', {
        moduleName: '@env', // Tên module bạn dùng trong import (ví dụ: import { API_BASE_URL } from '@env';)
        path: '.env',       // Đường dẫn đến file chứa biến môi trường
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true, // Cho phép các biến không được định nghĩa
      }],
      
      // (Nếu bạn dùng React Native Reanimated, bạn phải thêm dòng này: 'react-native-reanimated/plugin',)
    ],
  };
};