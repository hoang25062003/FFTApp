import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const CARD_WIDTH = width * 0.65;
export const SPACING = 12;
export const FULL_ITEM_WIDTH = CARD_WIDTH + SPACING;
export const SIDE_OFFSET = (width - FULL_ITEM_WIDTH) / 2;

const BRAND_COLOR = '#8BC34A';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // --- HEADER Section (giống ViewHealthMetric) ---
  headerSection: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    height: 150,
    backgroundColor: BRAND_COLOR,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
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
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // --- SECTION Styles ---
  sectionContainer: {
    marginTop: -10,
    marginBottom: 0,
  },
  formSection: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'flex-start',
  },
  cardSelectedShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
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
  cardIcon: { 
    fontSize: 20,
  },
  factorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  factorLabel: { 
    fontSize: 9, 
    color: 'rgba(255,255,255,0.9)', 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factorValue: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#FFFFFF',
    marginTop: 2,
  },
  titleWrapper: { 
    marginBottom: 10,
  },
  levelTitleEn: { 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  levelTitleVn: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1F2937',
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', 
    width: '100%', 
    marginBottom: 10,
  },
  shortDesc: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 6,
    lineHeight: 20,
  },
  longDesc: { 
    fontSize: 12, 
    color: '#6B7280', 
    lineHeight: 18,
    fontWeight: '500',
  },
  
  // Selected Badge
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedTextBold: {
    fontWeight: '700',
  },

  // --- FORM Styles ---
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 0,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
  },
  
  // Input Styles
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  inputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: BRAND_COLOR,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  // --- SUBMIT BUTTON ---
  submitButton: {
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});