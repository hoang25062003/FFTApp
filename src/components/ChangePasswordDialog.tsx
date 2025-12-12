import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { changePassword, ApiException } from '../services/AuthService';
import { styles } from './ChangePasswordDialogStyles';

type InputField = 'currentPassword' | 'newPassword' | 'confirmPassword' | null;

interface ChangePasswordDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const BRAND_COLOR = '#8BC34A';

  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<InputField>(null);

  // Error states
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validation helpers
  const validatePasswordLength = (password: string): boolean => {
    return password.length >= 8 && password.length <= 100;
  };

  const validatePasswordStrength = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // Handlers
  const handleFocus = (inputName: InputField) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setFocusedInput(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const validateForm = (): boolean => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    // Validate current password
    if (!currentPassword.trim()) {
      setCurrentPasswordError('Vui lòng nhập mật khẩu hiện tại');
      hasError = true;
    } else if (!validatePasswordLength(currentPassword)) {
      setCurrentPasswordError('Mật khẩu hiện tại phải từ 8-100 ký tự');
      hasError = true;
    }

    // Validate new password
    if (!newPassword.trim()) {
      setNewPasswordError('Vui lòng nhập mật khẩu mới');
      hasError = true;
    } else if (!validatePasswordLength(newPassword)) {
      setNewPasswordError('Mật khẩu mới phải từ 8-100 ký tự bao gồm chữ hoa, chữ thường, số và kí tự đặc biệt');
      hasError = true;
    } else if (!validatePasswordStrength(newPassword)) {
      setNewPasswordError('Mật khẩu mới phải từ 8-100 ký tự bao gồm chữ hoa, chữ thường, số và kí tự đặc biệt');
      hasError = true;
    } else if (newPassword === currentPassword) {
      setNewPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu mới');
      hasError = true;
    } else if (!validatePasswordLength(confirmPassword)) {
      setConfirmPasswordError('Mật khẩu xác nhận phải từ 8-100 ký tự');
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      hasError = true;
    }

    return !hasError;
  };

  const handleChangePassword = async () => {
    if (isLoading) return;

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        rePassword: confirmPassword,
      });

      Alert.alert(
        'Thành công',
        'Mật khẩu của bạn đã được thay đổi thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      let message = 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      
      if (error instanceof ApiException) {
        message = error.message;
        
        // Kiểm tra nếu lỗi là mật khẩu hiện tại không đúng
        if (
          message.toLowerCase().includes('incorrect') ||
          message.toLowerCase().includes('wrong') ||
          message.toLowerCase().includes('sai') ||
          message.toLowerCase().includes('không đúng') ||
          message.toLowerCase().includes('không chính xác')
        ) {
          setCurrentPasswordError('Mật khẩu hiện tại không chính xác');
          setIsLoading(false);
          return;
        }
      }

      Alert.alert('Đổi mật khẩu thất bại','Mật khẩu hiện tại không chính xác' );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <Icon name="key-variant" size={24} color={BRAND_COLOR} />
                  </View>
                  <Text style={styles.title}>Đổi mật khẩu</Text>
                  <Text style={styles.subtitle}>
                    Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    disabled={isLoading}
                  >
                    <Icon name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Current Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Mật khẩu hiện tại <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'currentPassword' && styles.inputFocused,
                      !!currentPasswordError && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={(text) => {
                        setCurrentPassword(text);
                        if (currentPasswordError) setCurrentPasswordError('');
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      onFocus={() => handleFocus('currentPassword')}
                      onBlur={handleBlur}
                      editable={!isLoading}
                      maxLength={100}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {currentPasswordError ? (
                    <Text style={styles.errorText}>{currentPasswordError}</Text>
                  ) : null}
                </View>

                {/* New Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Mật khẩu mới <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'newPassword' && styles.inputFocused,
                      !!newPasswordError && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (newPasswordError) setNewPasswordError('');
                      }}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      onFocus={() => handleFocus('newPassword')}
                      onBlur={handleBlur}
                      editable={!isLoading}
                      maxLength={100}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {newPasswordError ? (
                    <Text style={styles.errorText}>{newPasswordError}</Text>
                  ) : null}
 
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'confirmPassword' && styles.inputFocused,
                      !!confirmPasswordError && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={handleBlur}
                      editable={!isLoading}
                      maxLength={100}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.cancelButton, isLoading && { opacity: 0.6 }]}
                    onPress={handleClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
                    onPress={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangePasswordDialog;