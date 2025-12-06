import { StyleSheet, Platform } from 'react-native';

// Hằng số màu sắc (Export để sử dụng trong file Component)
export const BRAND_COLOR = '#8BC34A';
export const BG_COLOR = '#F8F9FA';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR
    },
    innerContainer: {
        flex: 1
    },

    // --- Header Section Styles ---
    headerSection: {
        marginBottom: 0,
    },
    headerBackground: {
        height: 140,
        backgroundColor: BRAND_COLOR,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -40,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: -20,
    },
    headerContent: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '500',
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Tab Card ---
    tabCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -30,
        borderRadius: 20,
        padding: 6,
        shadowColor: '#000',
        // Tối ưu hóa đổ bóng để giảm lag khi cuộn
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.08, // Giảm từ 0.1
        shadowRadius: 8, // Giảm từ 12
        elevation: 4, // Giảm từ 5
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: 'transparent',
        gap: 8,
    },
    activeTabItem: {
        backgroundColor: BRAND_COLOR,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFFFFF',
    },

    // --- Form Card ---
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        // Tối ưu hóa đổ bóng để giảm lag khi cuộn
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05,
        shadowRadius: 4, // Giảm từ 8
        elevation: 2, // Giảm từ 3
        marginBottom: 16,
    },
    formSection: {
        marginBottom: 4,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
    required: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
    },
    optional: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    inputBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: '#F9FAFB',
    },
    inputText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    placeholderText: {
        fontSize: 15,
        color: '#9CA3AF',
    },
    typeDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    typeIconBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownList: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        // Thêm đổ bóng nhẹ cho dropdown
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 10,
    },
    dropdownItemText: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },

    // --- Text Area ---
    textAreaContainer: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        height: 120, // Chiều cao cố định
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        fontSize: 15,
        color: '#1F2937',
        height: '100%',
        textAlignVertical: 'top',
    },

    charCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        gap: 12,
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },

    // Save Button
    saveButton: {
        flexDirection: 'row',
        backgroundColor: BRAND_COLOR,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // iOS DatePicker Modal
    iosModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    iosDatePickerContainer: {
        backgroundColor: 'white',
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosCancelText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    iosConfirmText: {
        color: BRAND_COLOR,
        fontSize: 16,
        fontWeight: '700',
    },
});