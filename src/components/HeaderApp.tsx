import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HeaderProps {
    isHome?: boolean;
    onBackPress?: () => void;
    onFilterPress?: () => void;  // Giữ lại để tương thích ngược
    onNotificationPress?: () => void;
}

const HeaderApp: React.FC<HeaderProps> = ({ 
    isHome = true,
    onBackPress,
    onFilterPress,  // Có thể override hành vi mặc định
    onNotificationPress 
}) => {
    const navigation = useNavigation<NavigationProp>();
    const brandColor = '#8BC34A'; 
    const iconColor = '#2C3E50';

    // ✅ Hàm xử lý mặc định cho nút Filter/Options
    const handleFilterPress = () => {
        if (onFilterPress) {
            // Nếu có prop truyền vào thì dùng prop (để linh hoạt)
            onFilterPress();
        } else {
            // Mặc định: Navigate đến ViewDietRestrictionScreen
            navigation.navigate('DietRestrictionFlow' as never);
        }
    };

    return (
        <View style={styles.headerContainer}>
            <SafeAreaView edges={['top']} style={styles.safeAreaBg}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                
                <View style={styles.headerContent}>
                    
                    {/* --- KHU VỰC BÊN TRÁI (LOGO hoặc BACK) --- */}
                    <View style={styles.leftContainer}>
                        {isHome ? (
                            // CASE 1: TRANG HOME -> Hiển thị Logo
                            <View style={styles.logoWrapper}>
                                <View style={styles.logoIconBg}>
                                    <Icon name="leaf" size={22} color={brandColor} />
                                </View>
                                <View style={styles.logoTextContainer}>
                                    <Text style={[styles.logoTextMain, { color: brandColor }]}>FitFood</Text>
                                    <Text style={styles.logoTextSub}>Tracker</Text>
                                </View>
                            </View>
                        ) : (
                            // CASE 2: KHÔNG PHẢI HOME -> Hiển thị nút Back + Logo
                            <View style={styles.logoWrapper}>
                                <TouchableOpacity 
                                    onPress={onBackPress}
                                    style={styles.backButton}
                                    activeOpacity={0.6}
                                >
                                    <Icon name="chevron-back" size={26} color={iconColor} />
                                </TouchableOpacity>
                                
                                <View style={styles.logoTextContainer}>
                                    <Text style={[styles.logoTextMain, { color: brandColor }]}>FitFood</Text>
                                    <Text style={styles.logoTextSub}>Tracker</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* --- KHU VỰC BÊN PHẢI (ACTIONS) --- */}
                    <View style={styles.headerActions}>
                        {/* ✅ NÚT FILTER/OPTIONS - Navigate đến ViewDietRestrictionScreen */}
                        <TouchableOpacity 
                            onPress={handleFilterPress}
                            style={styles.iconButton}
                            activeOpacity={0.6}
                        >
                            <Icon name="options-outline" size={24} color={iconColor} />
                        </TouchableOpacity>

                        {/* NÚT NOTIFICATION */}
                        <TouchableOpacity 
                            onPress={onNotificationPress} 
                            style={styles.iconButton}
                            activeOpacity={0.6}
                        >
                            <Icon name="notifications-outline" size={24} color={iconColor} />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
        zIndex: 10,
    },
    safeAreaBg: {
        backgroundColor: '#fff',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 60,
    },
    
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    logoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    logoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    backButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        paddingRight: 2, 
    },

    logoTextContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logoTextMain: {
        fontSize: 22,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-rounded' : 'Avenir Next',
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    logoTextSub: {
        fontSize: 22,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-rounded' : 'Avenir Next',
        fontWeight: '400',
        color: '#9CA3AF',
        marginLeft: 4,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
    }
});

export default HeaderApp;