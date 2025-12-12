import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import UserService from '../../services/UserService';
import { ApiException } from '../../services/AuthService';
import { styles } from './EditProfileScreenStyles';
import HeaderApp from '../../components/HeaderApp';
import ChangePasswordDialog from '../../components/ChangePasswordDialog'; // Import dialog

type InputField = 'firstName' | 'lastName' | 'dateOfBirth' | 'address' | 'bio' | null;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const BRAND_COLOR = '#8BC34A';

  // Refs for scrolling to error
  const scrollViewRef = React.useRef<ScrollView>(null);
  const firstNameRef = React.useRef<View>(null);
  const lastNameRef = React.useRef<View>(null);

  // State
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [bio, setBio] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  const [focusedInput, setFocusedInput] = useState<InputField>(null);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  // --- State cho ChangePasswordDialog ---
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  // Tính toán ngày tối thiểu và tối đa cho date picker
  const getDateLimits = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); // 1 năm trước
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // 120 năm trước
    return { minDate, maxDate };
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  // --- Handlers ---
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFocus = (inputName: InputField) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  // --- Helpers & Load Data ---
  const formatDateForDisplay = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const normalizeGender = (rawGender: string | null | undefined): 'Male' | 'Female' | null => {
    if (!rawGender) return null;
    const lower = rawGender.toLowerCase();
    if (lower === 'female') return 'Female';
    if (lower === 'male') return 'Male';
    return null;
  };

  const loadUserProfile = async () => {
    try {
      const profile = await UserService.getUserProfile();
      setAvatar(profile.avatarUrl || null);
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      if (profile.dateOfBirth) {
        const parsedDate = new Date(profile.dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          setDateObject(parsedDate);
          setDateOfBirth(formatDateForDisplay(profile.dateOfBirth));
        } else {
          setDateOfBirth(profile.dateOfBirth);
        }
      }
      setAddress(profile.address || '');
      const normalized = normalizeGender(profile.gender);
      setGender(normalized || 'Male');
      setBio(profile.bio || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập thư viện ảnh');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObject(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
    handleBlur();
  };

  const handleSave = async () => {
    // Reset errors
    setFirstNameError('');
    setLastNameError('');

    // Validate
    let hasError = false;
    let firstErrorRef = null;

    if (!firstName.trim()) {
      setFirstNameError('Họ không được để trống');
      hasError = true;
      if (!firstErrorRef) firstErrorRef = firstNameRef;
    }
    if (!lastName.trim()) {
      setLastNameError('Tên không được để trống');
      hasError = true;
      if (!firstErrorRef) firstErrorRef = lastNameRef;
    }

    if (hasError && firstErrorRef && firstErrorRef.current) {
      // Scroll to first error after a short delay to ensure error message is rendered
      setTimeout(() => {
        firstErrorRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          },
          () => {}
        );
      }, 100);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      if (dateOfBirth) {
        const parts = dateOfBirth.split('/');
        if (parts.length === 3) {
          formData.append('dateOfBirth', `${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          formData.append('dateOfBirth', dateOfBirth);
        }
      }
      if (address) formData.append('address', address.trim());
      if (gender) formData.append('gender', gender);
      if (bio) formData.append('bio', bio.trim());
      if (avatar && !avatar.startsWith('http')) {
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', {
          uri: avatar,
          name: filename || 'avatar.jpg',
          type: type,
        } as any);
      }
      await UserService.updateUserProfile(formData as any);
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const message = error instanceof ApiException ? error.message : 'Không thể cập nhật hồ sơ';
      Alert.alert('Lỗi', message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- CẬP NHẬT: Handler để mở dialog đổi mật khẩu ---
  const handleChangePassword = () => {
    setShowChangePasswordDialog(true);
  };

  // --- Handler khi đổi mật khẩu thành công ---
  const handlePasswordChangeSuccess = () => {
    // Optional: Có thể reload profile hoặc làm gì đó sau khi đổi mật khẩu thành công
    console.log('Password changed successfully in EditProfileScreen');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { minDate, maxDate } = getDateLimits();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerBackground}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
                <Text style={styles.headerSubtitle}>Cập nhật thông tin cá nhân</Text>
              </View>
              <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
                <View style={styles.iconCircle}>
                  <Icon name="lock-outline" size={16} color={BRAND_COLOR} />
                </View>
                <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="account" size={50} color="#9CA3AF" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              <Icon name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Chạm vào biểu tượng để thay đổi ảnh</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Icon name="account-edit" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          </View>

          {/* Name Row */}
          <View style={styles.row}>
            <View style={styles.halfInput} ref={firstNameRef}>
              <Text style={styles.label}>Họ <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input, 
                  focusedInput === 'firstName' && styles.inputFocused,
                  firstNameError && styles.inputError
                ]}
                value={firstName}
                onChangeText={(text) => {
                  if (text.length <= 50) {
                    setFirstName(text);
                    if (firstNameError) setFirstNameError('');
                  }
                }}
                placeholder="Nhập họ"
                placeholderTextColor="#9CA3AF"
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
                maxLength={50}
              />
              {firstNameError ? (
                <Text style={styles.errorText}>{firstNameError}</Text>
              ) : null}
            </View>
            <View style={styles.halfInput} ref={lastNameRef}>
              <Text style={styles.label}>Tên <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input, 
                  focusedInput === 'lastName' && styles.inputFocused,
                  lastNameError && styles.inputError
                ]}
                value={lastName}
                onChangeText={(text) => {
                  if (text.length <= 50) {
                    setLastName(text);
                    if (lastNameError) setLastNameError('');
                  }
                }}
                placeholder="Nhập tên"
                placeholderTextColor="#9CA3AF"
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
                maxLength={50}
              />
              {lastNameError ? (
                <Text style={styles.errorText}>{lastNameError}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.disabledInputWrapper}>
              <Icon name="email-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.disabledInput}
                value={email}
                editable={false}
              />
              <Icon name="lock" size={16} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity onPress={() => { setShowDatePicker(true); handleFocus('dateOfBirth'); }}>
              <View style={[styles.dateInputWrapper, focusedInput === 'dateOfBirth' && styles.inputFocused]}>
                <Icon name="calendar-outline" size={20} color={focusedInput === 'dateOfBirth' ? BRAND_COLOR : '#6B7280'} />
                <TextInput
                  style={styles.dateInput}
                  value={dateOfBirth}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  editable={false}
                  pointerEvents="none"
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateObject}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={maxDate}
                minimumDate={minDate}
              />
            )}
          </View>

          <View style={styles.divider} />

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={[styles.inputWrapper, focusedInput === 'address' && styles.inputFocused]}>
              <Icon name="map-marker-outline" size={20} color={focusedInput === 'address' ? BRAND_COLOR : '#6B7280'} />
              <TextInput
                style={styles.inputWithIcon}
                value={address}
                onChangeText={(text) => {
                  if (text.length <= 150) {
                    setAddress(text);
                  }
                }}
                placeholder="Nhập địa chỉ"
                placeholderTextColor="#9CA3AF"
                onFocus={() => handleFocus('address')}
                onBlur={handleBlur}
                maxLength={150}
              />
            </View>
            <View style={styles.charCountContainer}>
              <Icon name="map-marker" size={12} color="#9CA3AF" />
              <Text style={styles.charCount}>{address.length}/150 ký tự</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive]}
                onPress={() => setGender('Female')}
              >
                <Icon 
                  name="gender-female" 
                  size={20} 
                  color={gender === 'Female' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[styles.genderButtonText, gender === 'Female' && styles.genderButtonTextActive]}>
                  Nữ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive]}
                onPress={() => setGender('Male')}
              >
                <Icon 
                  name="gender-male" 
                  size={20} 
                  color={gender === 'Male' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[styles.genderButtonText, gender === 'Male' && styles.genderButtonTextActive]}>
                  Nam
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu</Text>
            <View style={[styles.bioInputWrapper, focusedInput === 'bio' && styles.inputFocused]}>
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Viết vài dòng về bản thân..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onFocus={() => handleFocus('bio')}
                onBlur={handleBlur}
                maxLength={150}
              />
            </View>
            <View style={styles.charCountContainer}>
              <Icon name="text" size={12} color="#9CA3AF" />
              <Text style={styles.charCount}>{bio.length}/150 ký tự</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()} 
            disabled={isSaving}
          >
            <Icon name="close" size={20} color="#6B7280" />
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]} 
            onPress={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Đang lưu...</Text>
              </>
            ) : (
              <>
                <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- THÊM ChangePasswordDialog --- */}
      <ChangePasswordDialog
        visible={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </SafeAreaView>
  );
};

export default EditProfileScreen;