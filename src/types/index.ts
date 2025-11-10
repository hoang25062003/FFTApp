import { TextStyle, ViewStyle } from 'react-native';

// Kiểu cho props của CustomInput
export interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  isPassword?: boolean;
  style?: ViewStyle;
}

// ✅ Cập nhật ButtonProps cho đúng với cách bạn đang dùng
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'google' | 'back' | 'link';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;            // ⚡ Thêm hỗ trợ disabled
  children?: React.ReactNode;    // ⚡ Cho phép thêm icon/loading
}

export interface BackButtonProps {
  onPress: () => void;
}
