import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    ActivityIndicator, 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderApp from '../../components//HeaderApp';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Types và Service
import styles from './ScanScreenStyles'; 
import ScanService, { DetectedIngredientResponse } from '../../services/ScanService';
import { ScanStackParamList } from '../../navigation/ScanStackNavigator'; // Import ScanStackParamList

// Định nghĩa kiểu dữ liệu cho Navigation Prop
type ScanScreenNavigationProp = NavigationProp<ScanStackParamList, 'ScanMain'>;

const ScanScreen: React.FC = () => {
    // Sử dụng kiểu dữ liệu đã định nghĩa
    const navigation = useNavigation<ScanScreenNavigationProp>(); 
    
    // Trạng thái ảnh đã chọn
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // Trạng thái thông báo lỗi
    const [errorText, setErrorText] = useState<string | null>(null);
    // Trạng thái loading khi gọi API
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleBackPress = () => navigation.goBack();
    const handleImageUpload = async () => {
        if (isLoading) return; 

        setErrorText(null);
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Cần quyền truy cập', 'Bạn cần cấp quyền truy cập Thư viện ảnh để chọn ảnh.');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8, 
        });

        if (!pickerResult.canceled) {
            setSelectedImage(pickerResult.assets[0].uri);
        }
    };


    const handleCameraCapture = async () => {
        if (isLoading) return;

        setErrorText(null);
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Cần quyền truy cập', 'Bạn cần cấp quyền truy cập Camera để chụp ảnh.');
            return;
        }

        const cameraResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!cameraResult.canceled) {
            setSelectedImage(cameraResult.assets[0].uri);
        }
    };

    const handleStartScan = async () => {
        if (!selectedImage) {
            setErrorText('Vui lòng chọn ảnh trước khi tiếp tục.');
            return;
        }

        try {
            setIsLoading(true);
            setErrorText(null);

            const results = await ScanService.detectIngredients({ image: selectedImage });
            
            console.log('Kết quả Scan:', results);

            if (results && results.length > 0) {
                navigation.navigate('ScanResult', {
                    results: results,
                    imageUri: selectedImage
                });

            } else {
                Alert.alert("Thông báo", "Không tìm thấy nguyên liệu nào rõ ràng trong ảnh.");
            }

        } catch (error: any) {
            console.error("Lỗi khi scan:", error);
            const message = error.message || 'Đã xảy ra lỗi không xác định.';
            setErrorText(message);
            Alert.alert("Lỗi phân tích", message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = () => {
        if (isLoading) return;
        setSelectedImage(null);
        setErrorText(null);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <HeaderApp isHome={false} onBackPress={handleBackPress} />


            <View style={styles.container}>
                
                <View style={styles.contentWrapper}>

                    <View style={styles.instructionContainer}>
                        <Text style={styles.headerTitle}>Nhận diện nguyên liệu</Text>
                    </View>

                    <View style={styles.scanAreaWrapper}>
                        {selectedImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: selectedImage }} style={styles.previewImage} />

                                {!isLoading && (
                                    <TouchableOpacity style={styles.closeButton} onPress={handleRemoveImage}>
                                    <Icon name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                )}

                                {isLoading && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 12,
                                    }}>
                                        <ActivityIndicator size="large" color="#8BC34A" />
                                        <Text style={{color: '#fff', marginTop: 10, fontWeight: '600'}}>Đang phân tích...</Text>
                                    </View>
                                )}
                            </View>
                        ) : (

                            <TouchableOpacity 
                                style={styles.dashedBox} 
                                activeOpacity={0.7}
                                onPress={handleCameraCapture} // Nhấn vào khung để chụp ảnh
                                disabled={isLoading}
                            >
                                <View style={styles.iconCircle}>
                                    <Icon name="camera-iris" size={40} color="#8BC34A" />
                                </View>
                                <Text style={styles.scanHintText}>Nhấn để chụp ảnh</Text>
                                <Text style={styles.scanSubHint}>hoặc chọn từ thư viện bên dưới</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {errorText && (
                        <View style={styles.errorContainer}>
                            <Icon name="alert-circle" size={18} color="#D32F2F" />
                            <Text style={styles.errorText}>{errorText}</Text>
                        </View>
                    )}

                </View>

                <View style={styles.actionContainer}>

                    <TouchableOpacity 
                        style={styles.uploadButton} 
                        onPress={handleImageUpload} 
                        disabled={!!selectedImage || isLoading}
                    >
                        <Icon name="image-outline" size={24} color={selectedImage || isLoading ? '#ccc' : '#8BC34A'} />
                        <Text style={[styles.uploadButtonText, (selectedImage || isLoading) && {color: '#ccc'}]}>
                            Chọn từ Thư viện
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            (!selectedImage || isLoading) && styles.disabledButton 
                        ]}
                        onPress={handleStartScan}
                        disabled={!selectedImage || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>
                                {selectedImage ? 'Bắt đầu Phân tích' : 'Vui lòng chọn ảnh'}
                                </Text>
                                {selectedImage && <Icon name="arrow-right" size={20} color="#fff" style={{marginLeft: 8}} />}
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default ScanScreen;