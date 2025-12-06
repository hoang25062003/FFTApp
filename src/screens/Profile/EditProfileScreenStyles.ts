import { StyleSheet, Dimensions } from 'react-native';

const BRAND_COLOR = '#8BC34A';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // --- GREEN HEADER SECTION (Giống ViewHealthMetric) ---
  greenHeaderSection: {
    marginBottom: 0,
    backgroundColor: '#F8F9FA', // Màu nền phía sau
  },
  greenHeaderBackground: {
    height: 140, 
    backgroundColor: BRAND_COLOR, // Nền xanh chủ đạo
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center', 
  },
  // Họa tiết trang trí tròn
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
  greenHeaderContent: {
    paddingHorizontal: 20,
    paddingBottom: 45, // Đẩy text lên trên một chút để nhường chỗ cho Avatar
    flexDirection: 'row',
    justifyContent: 'center', // Căn giữa nội dung
    alignItems: 'center',
    zIndex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  // --- SCROLL VIEW & AVATAR ---
  scrollView: {
    flex: 1,
    overflow: 'visible',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50, // QUAN TRỌNG: Kéo Avatar lên đè lên phần xanh
    zIndex: 10,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    resizeMode: 'cover',
    borderWidth: 4,
    borderColor: '#FFFFFF', // Viền trắng tạo độ tách biệt với nền xanh
    backgroundColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarTextContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  avatarHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },

  // --- FORM SECTION (Giữ nguyên phong cách sạch sẽ) ---
  formSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
    borderColor: '#E5E7EB',
  },
  bioInput: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  bioInputFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: '#FFFFFF',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  dateInputWrapperFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  dateIcon: {
    paddingLeft: 10,
    color: '#6B7280',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  genderButtonActive: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  genderButtonTextActive: {
    color: '#fff',
  },

  // --- FOOTER ---
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  saveButton: {
    flex: 1,
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});