import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// Khối nhập liệu tiêu chuẩn
const InputBlock: React.FC<{ label: string; placeholder: string; unit?: string; value: string; onChangeText: (text: string) => void }> = ({
  label,
  placeholder,
  unit,
  value,
  onChangeText,
}) => (
  <View style={styles.inputBlock}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputFieldContainer}>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={label.includes('Số điện thoại') || label.includes('Tuổi') || label.includes('Chiều cao') || label.includes('Cân nặng') ? 'numeric' : 'default'}
      />
      {unit && <Text style={styles.unitText}>{unit}</Text>}
    </View>
  </View>
);

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Dữ liệu giả lập
  const [firstName, setFirstName] = useState('Robin');
  const [lastName, setLastName] = useState('Jonnson');
  const [email, setEmail] = useState('robin.jonnson@example.com');
  const [phone, setPhone] = useState('0912345678');
  const [address, setAddress] = useState('123 Main St, Anytown');
  const [gender, setGender] = useState('Nam');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');

  const handleSaveChanges = () => {
    // Logic lưu thay đổi (API call)
    console.log('Đã lưu thay đổi hồ sơ!');
    // Sau khi lưu, có thể quay lại màn hình trước
    navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header/Close button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.imageWrapper}>
             <Image 
                source={{ uri: 'https://placehold.co/100x100/A5D6A7/000000?text=R+J' }} // Placeholder ảnh đại diện
                style={styles.profileImage}
            />
          </View>
          <View style={styles.imageTextContainer}>
            <Text style={styles.uploadImageText}>Tải ảnh của bạn lên</Text>
            <Text style={styles.uploadImageHint}>Ảnh của bạn phải có định dạng PNG hoặc JPG.</Text>
            <TouchableOpacity style={styles.chooseImageButton}>
              <Text style={styles.chooseImageButtonText}>Chọn ảnh đại diện</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.infoRow}>
          <InputBlock label="Họ" placeholder="Nhập họ..." value={firstName} onChangeText={setFirstName} />
          <InputBlock label="Tên" placeholder="Nhập tên..." value={lastName} onChangeText={setLastName} />
        </View>

        <InputBlock label="Email" placeholder="Nhập email..." value={email} onChangeText={setEmail} />
        <InputBlock label="Số điện thoại" placeholder="Nhập SĐT..." value={phone} onChangeText={setPhone} />
        <InputBlock label="Địa chỉ cụ thể" placeholder="Nhập địa chỉ..." value={address} onChangeText={setAddress} />

        {/* Gender and Age */}
        <View style={styles.infoRow}>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Giới tính</Text>
            <View style={styles.radioGroup}>
                <TouchableOpacity 
                    style={[styles.radioOption, gender === 'Nữ' && styles.radioActive]}
                    onPress={() => setGender('Nữ')}
                >
                    <Text style={[styles.radioText, gender === 'Nữ' && styles.radioTextActive]}>Nữ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.radioOption, gender === 'Nam' && styles.radioActive]}
                    onPress={() => setGender('Nam')}
                >
                    <Text style={[styles.radioText, gender === 'Nam' && styles.radioTextActive]}>Nam</Text>
                </TouchableOpacity>
            </View>
          </View>
          <InputBlock label="Tuổi" placeholder="Nhập tuổi" value={age} onChangeText={setAge} />
        </View>

        {/* Height and Weight */}
        <View style={styles.infoRow}>
          <InputBlock label="Chiều cao" placeholder="0" unit="cm" value={height} onChangeText={setHeight} />
          <InputBlock label="Cân nặng" placeholder="0" unit="kg" value={weight} onChangeText={setWeight} />
        </View>
        
        {/* Padding cuối cùng */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 30, // Căn chỉnh tương đối với nút đóng
  },
  closeButton: {
    padding: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#8BC34A',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageTextContainer: {
    flex: 1,
  },
  uploadImageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  uploadImageHint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  chooseImageButton: {
    borderWidth: 1,
    borderColor: '#8BC34A',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  chooseImageButtonText: {
    color: '#8BC34A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputBlock: {
    flex: 1,
    marginRight: 10,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 40,
  },
  unitText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginTop: 5,
  },
  radioOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  radioActive: {
    backgroundColor: '#8BC34A',
  },
  radioText: {
    color: '#555',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#8BC34A',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;