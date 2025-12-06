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
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import UserService from '../../services/UserService';
import { ApiException } from '../../services/AuthService';
import { styles } from './EditProfileScreenStyles';
import HeaderApp from '../../components/HeaderApp';

type InputField = 'firstName' | 'lastName' | 'dateOfBirth' | 'address' | 'bio' | null;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const BRAND_COLOR = '#8BC34A';

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
    setShowDatePicker(Platform.OS === 'ios');
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
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8BC34A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} >
      {/* 1. HEADER APP ĐÃ CẬP NHẬT onBackPress */}
      <HeaderApp 
        isHome={false} 
        onBackPress={handleBackPress} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* 2. PHẦN BODY MỞ ĐẦU */}
        <View style={styles.greenHeaderSection}>
          <View style={styles.greenHeaderBackground}>
            {/* Họa tiết trang trí */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.greenHeaderContent}>
              <View>
                <Text style={styles.headerSubtitle}>Cập nhật thông tin</Text>
                <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. AVATAR */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="person" size={50} color="#BDBDBD" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
               <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.avatarTextContainer}>
            <Text style={styles.avatarHint}>Chạm vào máy ảnh để thay đổi</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Họ</Text>
              <TextInput
                style={[styles.input, focusedInput === 'firstName' && styles.inputFocused]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Nhập họ"
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Tên</Text>
              <TextInput
                style={[styles.input, focusedInput === 'lastName' && styles.inputFocused]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nhập tên"
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity 
              onPress={() => { setShowDatePicker(true); handleFocus('dateOfBirth'); }} 
              activeOpacity={1}
            >
              <View style={[styles.dateInputWrapper, focusedInput === 'dateOfBirth' && styles.dateInputWrapperFocused]}>
                <TextInput
                  style={styles.dateInput}
                  value={dateOfBirth}
                  placeholder="DD/MM/YYYY"
                  editable={false}
                  pointerEvents="none"
                />
                <Icon name="calendar-outline" size={22} color={focusedInput === 'dateOfBirth' ? '#1A1A1A' : '#6B7280'} style={styles.dateIcon} />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateObject}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, focusedInput === 'address' && styles.inputFocused]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              onFocus={() => handleFocus('address')}
              onBlur={handleBlur}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive]}
                onPress={() => setGender('Female')}
              >
                <Text style={[styles.genderButtonText, gender === 'Female' && styles.genderButtonTextActive]}>Nữ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive]}
                onPress={() => setGender('Male')}
              >
                <Text style={[styles.genderButtonText, gender === 'Male' && styles.genderButtonTextActive]}>Nam</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu</Text>
            <TextInput
              style={[styles.input, styles.bioInput, focusedInput === 'bio' && styles.bioInputFocused]}
              value={bio}
              onChangeText={setBio}
              placeholder="Viết vài dòng về bản thân..."
              multiline
              textAlignVertical="top"
              onFocus={() => handleFocus('bio')}
              onBlur={handleBlur}
            />
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isSaving}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;