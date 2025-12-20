import { StyleSheet, Platform } from 'react-native';
import { BRAND_COLOR, BG_COLOR, COLORS } from '../constants/Colors';

export const commonStyles = StyleSheet.create({
  // --- Container Styles ---
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // --- Header Section Styles ---
  headerSection: {
    marginBottom: 20,
    backgroundColor: BG_COLOR,
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
  headerBackgroundLarge: {
    height: 280,
    backgroundColor: BRAND_COLOR,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
  decorativeCircle1Large: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -80,
    right: -60,
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
  decorativeCircle2Large: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -40,
    left: -40,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.white,
    letterSpacing: -0.5,
  },
  headerTitleLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text.white,
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
  headerIconContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  // --- Card Styles ---
  card: {
    backgroundColor: COLORS.bg.default,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cardLarge: {
    backgroundColor: COLORS.bg.default,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  // --- Tab Styles ---
  tabCard: {
    backgroundColor: COLORS.bg.default,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
  tabItemActive: {
    backgroundColor: BRAND_COLOR,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.text.white,
  },

  // --- Label & Text Styles ---
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  required: {
    color: COLORS.status.error,
    fontSize: 15,
    fontWeight: '700',
  },
  optional: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    lineHeight: 16,
  },

  // --- Input Styles ---
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.bg.light,
  },
  inputBoxFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: COLORS.bg.default,
  },
  inputBoxError: {
    borderColor: COLORS.status.error,
    backgroundColor: COLORS.bg.error,
  },
  inputText: {
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.text.tertiary,
  },
  inputLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: COLORS.bg.light,
    gap: 12,
  },
  inputLargeFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: COLORS.bg.default,
  },
  inputLargeError: {
    borderColor: COLORS.status.error,
    backgroundColor: COLORS.bg.error,
  },

  // --- Text Area Styles ---
  textAreaContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: 12,
    height: 120,
    backgroundColor: COLORS.bg.light,
  },
  textAreaContainerFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: COLORS.bg.default,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.text.primary,
    height: '100%',
    textAlignVertical: 'top',
  },

  // --- Button Styles ---
  button: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonLarge: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: COLORS.bg.default,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
  },
  buttonOutlineText: {
    color: BRAND_COLOR,
  },

  // --- Dropdown Styles ---
  dropdownList: {
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: COLORS.bg.default,
    overflow: 'hidden',
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
    borderBottomColor: COLORS.border.light,
    gap: 10,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '500',
  },

  // --- Info Card Styles ---
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg.lighter,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  infoCardSuccess: {
    backgroundColor: COLORS.bg.success,
    borderColor: '#A7F3D0',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bg.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  // --- Empty State Styles ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.bg.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },

  // --- Divider Styles ---
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 20,
  },

  // --- Modal Styles (iOS DatePicker) ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: COLORS.bg.default,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalCancelText: {
    color: COLORS.status.error,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: BRAND_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },

  // --- Flex Layout Styles ---
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },

  // --- Spacing Helpers ---
  gap8: {
    gap: 8,
  },
  gap12: {
    gap: 12,
  },
  gap16: {
    gap: 16,
  },
  gap20: {
    gap: 20,
  },
});