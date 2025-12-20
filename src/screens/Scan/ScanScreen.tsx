import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderApp from '../../components/HeaderApp';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
// import { SafeAreaView } from 'react-native-safe-area-context';

// Import Types và Service
import styles from './ScanScreenStyles';
import ScanService from '../../services/ScanService';
import { ScanStackParamList } from '../../navigation/ScanStackNavigator';

type ScanScreenNavigationProp = NavigationProp<ScanStackParamList, 'ScanMain'>;

const ScanScreen: React.FC = () => {
    const navigation = useNavigation<ScanScreenNavigationProp>();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);
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
            // console.error("Lỗi khi scan:", error);
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
        <View style={styles.container} >
            <StatusBar barStyle="dark-content" backgroundColor="#8BC34A" />
            <HeaderApp isHome={false} onBackPress={handleBackPress} />

            <View style={styles.innerContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerBackground}>
                            <View style={styles.decorativeCircle1} />
                            <View style={styles.decorativeCircle2} />
                            <View style={styles.headerContent}>
                                <View>
                                    <Text style={styles.headerTitle}>Nhận Diện Nguyên Liệu</Text>
                                    <Text style={styles.headerSubtitle}>Chụp ảnh để AI phân tích món ăn</Text>
                                </View>
                                <View style={styles.headerIconContainer}>
                                    <Icon name="camera-iris" size={28} color="rgba(255,255,255,0.9)" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Image Preview Card */}
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Icon name="image-multiple" size={18} color="#8BC34A" />
                            <Text style={styles.sectionTitle}>Hình ảnh món ăn</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <Text style={styles.sectionHint}>Chụp hoặc chọn ảnh món ăn để phân tích</Text>

                        <View style={styles.imagePreviewWrapper}>
                            {selectedImage ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />

                                    {!isLoading && (
                                        <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                                            <Icon name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {isLoading && (
                                        <View style={styles.loadingOverlay}>
                                            <ActivityIndicator size="large" color="#8BC34A" />
                                            <Text style={styles.loadingText}>Đang phân tích...</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.imagePlaceholder}
                                    activeOpacity={0.7}
                                    onPress={handleCameraCapture}
                                    disabled={isLoading}
                                >
                                    <View style={styles.iconCircle}>
                                        <Icon name="camera-iris" size={48} color="#8BC34A" />
                                    </View>
                                    <Text style={styles.placeholderText}>Nhấn để chụp ảnh</Text>
                                    <Text style={styles.placeholderSubtext}>hoặc chọn từ thư viện bên dưới</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Upload Button */}
                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                (!!selectedImage || isLoading) && styles.uploadButtonDisabled
                            ]}
                            onPress={handleImageUpload}
                            disabled={!!selectedImage || isLoading}
                        >
                            <Icon
                                name="image-outline"
                                size={20}
                                color={selectedImage || isLoading ? '#9CA3AF' : '#8BC34A'}
                            />
                            <Text style={[
                                styles.uploadButtonText,
                                (selectedImage || isLoading) && styles.uploadButtonTextDisabled
                            ]}>
                                Chọn từ Thư viện ảnh
                            </Text>
                        </TouchableOpacity>

  
                        <View style={styles.analyzeButtonContainer}>

                            
                            <TouchableOpacity
                                style={[
                                    styles.analyzeButton,
                                    (!selectedImage || isLoading) && styles.analyzeButtonDisabled
                                ]}
                                onPress={handleStartScan}
                                disabled={!selectedImage || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.analyzeButtonText}>Đang phân tích...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="magnify-scan" size={20} color="#FFFFFF" />
                                        <Text style={styles.analyzeButtonText}>
                                            {selectedImage ? 'Bắt đầu phân tích' : 'Vui lòng chọn ảnh'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* Error Message */}
                    {errorText && (
                        <View style={styles.errorCard}>
                            <View style={styles.errorIconContainer}>
                                <Icon name="alert-circle" size={20} color="#EF4444" />
                            </View>
                            <View style={styles.errorTextContainer}>
                                <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
                                <Text style={styles.errorText}>{errorText}</Text>
                            </View>
                        </View>
                    )}

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Icon name="information-outline" size={20} color="#8BC34A" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Mẹo hay</Text>
                            <Text style={styles.infoText}>
                                Chụp ảnh rõ nét và đầy đủ các nguyên liệu để có kết quả tốt nhất.
                            </Text>
                        </View>
                    </View>

                </ScrollView>
                {/* Đã xóa View Footer ở đây */}
            </View>
        </View>
    );
};

export default ScanScreen;