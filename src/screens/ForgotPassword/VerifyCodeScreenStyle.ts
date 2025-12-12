import { StyleSheet } from 'react-native';

const BRAND_COLOR = '#8BC34A';
const BG_COLOR = '#F8F9FA';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    marginBottom: 20,
  },
  headerBackground: {
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
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -80,
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -40,
    left: -40,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    marginTop: -40,
    marginBottom: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircleCompleted: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  progressCircleActiveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: {
    flex: 1,
    height: 2,
    backgroundColor: BRAND_COLOR,
    marginHorizontal: 8,
  },
  progressStepNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },

  // OTP Card
  otpCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 28,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 15,
    color: BRAND_COLOR,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // OTP Input
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  otpInputFilled: {
    borderColor: BRAND_COLOR,
    backgroundColor: '#FFFFFF',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Verify Button
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Resend Section
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND_COLOR,
    letterSpacing: 0.3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Change Email
  changeEmailContainer: {
    alignItems: 'center',
  },
  changeEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  changeEmailText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND_COLOR,
    letterSpacing: 0.3,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
    marginTop: 20,
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

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});