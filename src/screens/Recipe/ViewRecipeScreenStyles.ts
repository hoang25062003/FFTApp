import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const BRAND_COLOR = '#8BC34A';
const BG_COLOR = '#F8F9FA';

const styles = StyleSheet.create({
  // ==========================
  // 1. GENERAL & LOADING
  // ==========================
  container: { 
    flex: 1, 
    backgroundColor: BG_COLOR 
  },
  
  innerContainer: {
    flex: 1
  },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: BG_COLOR 
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // ==========================
  // 2. HEADER SECTION
  // ==========================
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

  // ==========================
  // 3. TAB NAVIGATION
  // ==========================
  tabCard: {
    backgroundColor: '#FFFFFF',
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

  // ==========================
  // 4. MAIN CONTENT
  // ==========================
  scrollContent: {
    paddingBottom: 40,
  },

  imageCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  
  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F3F4F6',
  },
  
  tagOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  
  recipeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 32,
  },
  
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  
  authorSection: {
    marginTop: 0,
  },
  
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  defaultAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  
  authorLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  section: {
    marginTop: 0,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },

  ingredientList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 8,
  },
  
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND_COLOR,
    marginRight: 12,
  },
  
  ingredientName: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },

  // ✅ THÊM: Warning badge styles
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },

  warningBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  
  quantityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },

  stepCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stepNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  
  stepInstruction: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 12,
  },
  
  stepImageScroll: {
    marginTop: 8,
  },
  
  stepImage: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

  // ==========================
  // 5. REVIEW SECTION
  // ==========================
  reviewContainer: {
    flex: 1,
  },

  ratingSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    alignItems: 'center',
  },

  ratingMainSection: {
    alignItems: 'center',
  },

  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 12,
  },

  reviewInputContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },

  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },

  inputFocused: {
    borderColor: BRAND_COLOR,
    backgroundColor: '#FFFFFF',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  inputBox: {
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 100,
    fontWeight: '500',
  },

  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
    marginLeft: 4,
  },

  submitButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  reviewListCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },

  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reviewerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  reviewerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },

  reviewActions: {
    alignItems: 'flex-end',
    gap: 4,
  },

  actionIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },

  reviewDate: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },

  // ==========================
  // 6. BOTTOM ACTIONS
  // ==========================
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },

  duplicateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  duplicateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_COLOR,
  },

  saveButton: {
    flex: 1,
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  saveButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BRAND_COLOR,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  saveButtonTextActive: {
    color: BRAND_COLOR,
  },

  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  editButton: {
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  ratingScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  ratingScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 64,
  },

  ratingCount: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },

  // ==========================
  // 7. COMMENT SECTION
  // ==========================
  commentContainer: {
    flex: 1,
  },

  commentInputContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  replyingToText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  replyingToName: {
    color: BRAND_COLOR,
    fontWeight: '700',
  },

  commentInputWrapper: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    marginBottom: 12,
  },

  commentInput: {
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
    fontWeight: '500',
  },

  commentSubmitButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  commentSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  commentListCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },

  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  replyItem: {
    marginLeft: 20,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLOR,
  },

  commentAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  commentInfo: {
    flex: 1,
    marginLeft: 12,
  },

  commentUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },

  commentDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  commentActionIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },

  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 8,
  },

  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  replyButtonText: {
    fontSize: 14,
    color: BRAND_COLOR,
    fontWeight: '600',
  },

  repliesContainer: {
    marginTop: 12,
  },

  tabLoadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  tabLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default styles;