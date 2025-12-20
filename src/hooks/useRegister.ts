import { useState, useRef } from 'react';
import { Alert, TextInput, ScrollView } from 'react-native';
import { register } from '../services/AuthService';
import { AuthRoutes } from '../navigation/RouteNames';

type InputField = 'firstName' | 'lastName' | 'email' | 'password' | 'rePassword' | 'dateOfBirth' | null;

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rePassword: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
}

interface RegisterErrors {
  [key: string]: string;
}

export const useRegister = (navigation: any) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const rePasswordRef = useRef<TextInput>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rePassword: '',
    dateOfBirth: '',
    gender: 'Male',
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<InputField>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  const getDateLimits = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return { minDate, maxDate };
  };

  const handleFocus = (inputName: InputField) => {
    setFocusedInput(inputName);
    if (inputName && errors[inputName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[inputName];
        return newErrors;
      });
    }
  };

  const handleBlur = () => setFocusedInput(null);

  const updateField = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['dateOfBirth'];
        return newErrors;
      });
      setDateObject(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      updateField('dateOfBirth', `${day}/${month}/${year}`);
    }
    handleBlur();
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Bạn chưa điền Họ.";
    if (!formData.lastName.trim()) newErrors.lastName = "Bạn chưa điền Tên.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập Email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Địa chỉ email không đúng định dạng.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
    if (!formData.password) {
      newErrors.password = "Vui lòng đặt mật khẩu.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Mật khẩu cần từ 8-100 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
    }

    if (!formData.rePassword) {
      newErrors.rePassword = "Hãy xác nhận lại mật khẩu.";
    } else if (formData.rePassword !== formData.password) {
      newErrors.rePassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Hãy chọn ngày sinh của bạn.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const parts = formData.dateOfBirth.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      rePassword: formData.rePassword,
      dateOfBirth: formattedDate,
      gender: formData.gender,
    };

    setIsLoading(true);
    try {
      await register(payload);
      Alert.alert('Đăng ký thành công', 'Vui lòng kiểm tra email của bạn để lấy mã OTP.');
      navigation.navigate(AuthRoutes.VerifyEmailOtp, { email: formData.email.trim() });
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    scrollViewRef,
    firstNameRef,
    lastNameRef,
    emailRef,
    passwordRef,
    rePasswordRef,
    formData,
    errors,
    showPassword,
    showRePassword,
    isLoading,
    focusedInput,
    showDatePicker,
    dateObject,
    getDateLimits,
    setShowPassword,
    setShowRePassword,
    setShowDatePicker,
    updateField,
    handleFocus,
    handleBlur,
    onDateChange,
    handleRegister,
  };
};