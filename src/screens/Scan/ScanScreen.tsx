import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  // Đã bỏ Modal vì dùng chức năng Native
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // ⚠️ Thêm thư viện ImagePicker

// Giả lập các tab điều hướng
const tabs = ['Home', 'Scan', 'Loading', 'Results'];

const ScanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Scan');
  // Trạng thái ảnh đã chọn
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  // Trạng thái để thông báo lỗi nếu không có quyền
  const [errorText, setErrorText] = useState<string | null>(null);


  // 1. Lấy ảnh từ Thư viện (nhấn vào nút Upload Image)
  const handleImageUpload = async () => {
    setErrorText(null);
    console.log('Kích hoạt chức năng chọn ảnh từ Thư viện (Gallery)');
    
    // Yêu cầu quyền truy cập thư viện
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setErrorText('Bạn cần cấp quyền truy cập Thư viện ảnh để chọn ảnh.');
      return;
    }

    // Mở Thư viện ảnh
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Cho phép người dùng chỉnh sửa ảnh (tùy chọn)
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      // Lấy URI ảnh đầu tiên
      setSelectedImage(pickerResult.assets[0].uri);
    } else {
      console.log('Người dùng đã hủy chọn ảnh.');
    }
  };

  // 2. Lấy ảnh từ Camera (nhấn vào biểu tượng Camera lớn)
  const handleCameraCapture = async () => {
    setErrorText(null);
    console.log('Kích hoạt chức năng Camera để chụp ảnh');

    // Yêu cầu quyền truy cập camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      setErrorText('Bạn cần cấp quyền truy cập Camera để chụp ảnh.');
      return;
    }

    // Mở Camera
    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cameraResult.canceled) {
      // Lấy URI ảnh đầu tiên
      setSelectedImage(cameraResult.assets[0].uri);
    } else {
      console.log('Người dùng đã hủy chụp ảnh.');
    }
  };

  const handleStartScan = () => {
    if (selectedImage) {
      console.log('Bắt đầu quét với ảnh đã chọn:', selectedImage);
      // Logic chuyển sang tab Loading/Results
      // setActiveTab('Loading');
    } else {
      setErrorText('Vui lòng chọn hoặc chụp ảnh trước khi quét.');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Item</Text>
        <View style={styles.backButton} /> {/* Placeholder */}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Error Message */}
        {errorText && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={20} color="#D32F2F" />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {/* Scan Card */}
        <View style={styles.scanCard}>
          {selectedImage ? (
            // HIỂN THỊ ẢNH ĐÃ CHỌN
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                <Icon name="close-circle" size={28} color="#E57373" />
              </TouchableOpacity>
              <Text style={styles.imageSourceText}>
                Ảnh đã chọn. Nhấn vào biểu tượng Camera hoặc Upload để thay đổi.
              </Text>
            </View>
          ) : (
            // HIỂN THỊ TRẠNG THÁI CHUẨN BỊ QUÉT
            <>
              {/* Biểu tượng Camera (Nhấn vào đây để mở Camera) */}
              <TouchableOpacity onPress={handleCameraCapture} style={styles.cameraIconArea}>
                <Icon name="camera-outline" size={80} color="#888" />
              </TouchableOpacity>
              
              <Text style={styles.readyText}>Ready to Scan</Text>
              <Text style={styles.orText}>Or</Text>

              {/* Nút Upload Image (Nhấn vào đây để mở Thư viện) */}
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Icon name="cloud-upload-outline" size={24} color="#8BC34A" />
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Start Scan Button */}
        <TouchableOpacity 
          style={[styles.startButton, !selectedImage && styles.disabledButton]} 
          onPress={handleStartScan}
          disabled={!selectedImage} // Chỉ cho phép bấm khi có ảnh
        >
          <Text style={styles.startButtonText}>Start Scan</Text>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tabItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8BC34A', // Màu xanh lá cây
    fontWeight: 'bold',
  },
  tabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: '#8BC34A',
    borderRadius: 1.5,
    marginTop: 5,
    position: 'absolute',
    bottom: -10, // Đẩy xuống dưới tab
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5', // Nền hơi xám
    alignItems: 'center',
  },
  // --- Thêm style cho box lỗi ---
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE', // Màu hồng nhạt
    borderColor: '#D32F2F', // Màu đỏ
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    marginLeft: 8,
    color: '#D32F2F',
    fontSize: 14,
    flexShrink: 1,
  },
  // ------------------------------
  scanCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 250, // Đảm bảo thẻ có chiều cao cố định
  },
  cameraIconArea: {
    padding: 20,
    marginBottom: 10,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  orText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 15,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#8BC34A',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  startButton: {
    width: '100%',
    backgroundColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD', // Màu xám cho nút bị vô hiệu hóa
  },
  // --- Style cho ảnh đã chọn ---
  selectedImageContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  imageSourceText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ScanScreen;