// FILE: src/screens/ForgotPassword/ForgotPasswordFlowStyles.ts
// ✅ Version sạch - KHÔNG CÓ fontFamily

import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors'; 

const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 10,
        paddingBottom: 40,
        backgroundColor: Colors.background || '#FFFFFF',
    },
    
    // --- Header và Logo ---
    backButton: {
        paddingVertical: 10,
        width: 40,
        height: 40,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary || '#333333',
        alignSelf: 'center',
        position: 'absolute',
        top: 15,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 60,
    },

    // --- Tiêu đề và Mô tả ---
    mainHeading: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary || '#66BB6A',
        textAlign: 'center',
        marginBottom: 5,
    },
    subHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary || '#333333',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary || '#666666',
        textAlign: 'center',
        marginBottom: 30,
    },

    // --- Thanh tiến trình (Progress Bar) ---
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingHorizontal: 15,
    },
    progressStep: {
        alignItems: 'center',
    },
    
    // Trạng thái KÍCH HOẠT (Active)
    stepCircleActive: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary || '#66BB6A', 
        color: Colors.white || '#FFFFFF',
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        overflow: 'hidden',
    },
    stepTextActive: {
        fontSize: 12,
        color: Colors.primary || '#66BB6A',
        fontWeight: 'bold',
    },
    progressLineActive: {
        flex: 1,
        height: 2,
        backgroundColor: Colors.primary || '#66BB6A',
        marginHorizontal: -5, 
    },
    
    // Trạng thái HOÀN THÀNH (Complete)
    stepCircleComplete: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary || '#66BB6A', 
        color: Colors.white || '#FFFFFF',
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        overflow: 'hidden',
    },
    stepTextComplete: {
        fontSize: 12,
        color: Colors.primary || '#66BB6A',
        fontWeight: 'bold',
    },
    progressLineComplete: {
        flex: 1,
        height: 2,
        backgroundColor: Colors.primary || '#66BB6A',
        marginHorizontal: -5, 
    },
    
    // Trạng thái KHÔNG KÍCH HOẠT (Inactive)
    stepCircleInactive: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E0E0E0', 
        color: Colors.textSecondary || '#666666',
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        overflow: 'hidden',
    },
    stepTextInactive: {
        fontSize: 12,
        color: Colors.textSecondary || '#666666',
    },
    progressLineInactive: {
        flex: 1,
        height: 2,
        backgroundColor: '#E0E0E0',
        marginHorizontal: -5,
    },

    // --- Input và Button ---
    inputLabel: {
        fontSize: 16,
        color: Colors.textPrimary || '#333333',
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    
    mainButton: {
        marginTop: 30,
    },

    // --- Links ---
    loginLinkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginLinkText: {
        color: Colors.textLink || '#666666', 
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    
    passwordHint: {
        fontSize: 12,
        color: Colors.textSecondary || '#888888',
        marginBottom: 10,
    },
    backLinkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    backLinkText: {
        color: Colors.textLink || '#666666', 
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    
    actionLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    linkText: {
        color: Colors.textLink || '#666666',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});

export default sharedStyles;