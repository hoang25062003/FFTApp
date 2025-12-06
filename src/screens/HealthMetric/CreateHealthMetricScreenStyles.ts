import { StyleSheet, Dimensions, Platform } from 'react-native';

// --- CẤU HÌNH KÍCH THƯỚC ---
const { width } = Dimensions.get('window');

// Export các hằng số này để Component có thể sử dụng cho logic
export const CARD_WIDTH = width * 0.65; // Thẻ chiếm 65% chiều rộng
export const SPACING = 12; // Khoảng cách giữa các thẻ
export const FULL_ITEM_WIDTH = CARD_WIDTH + SPACING; // Kích thước tổng của 1 item
export const SIDE_OFFSET = (width - FULL_ITEM_WIDTH) / 2; // Padding để item nằm giữa

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 110, // Để tránh nút Footer che mất nội dung
  },
  
  // --- HEADER Styles ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },

  // --- SECTION Styles ---
  sectionContainer: {
    marginTop: 20,
  },
  formSection: {
    marginTop: 20,
    paddingHorizontal: 20, 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    marginLeft: 4,
  },

  // --- ACTIVITY CARD Styles ---
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    height: 280,
    borderTopWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'flex-start',
  },
  cardSelectedShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 20 },
  factorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  factorLabel: { fontSize: 8, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', textTransform: 'uppercase' },
  factorValue: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  titleWrapper: { marginBottom: 10 },
  levelTitleEn: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  levelTitleVn: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#E2E8F0', width: '100%', marginBottom: 10 },
  shortDesc: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  longDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  feedbackContainer: { alignItems: 'center', marginTop: 5 },
  feedbackText: { fontSize: 13, color: '#64748B' },

  // --- FORM Styles (MỚI CẬP NHẬT) ---
  // Style cho khung trắng bao quanh form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    // Đổ bóng nhẹ để nổi lên nền xám
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 15,
  },
  halfInput: {
    width: '48%', 
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  
  // Style cho Input thường
  input: {
    backgroundColor: '#F1F5F9', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  
  // Style khi Input được focus
  inputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#84CC16', 
    shadowColor: '#84CC16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Style riêng cho Bio
  bioInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top', 
  },
  bioInputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#84CC16',
  },

  // --- FOOTER Styles ---

  submitButton: {
    backgroundColor: '#84CC16',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#84CC16',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    width: 370,
    alignSelf: 'center',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});