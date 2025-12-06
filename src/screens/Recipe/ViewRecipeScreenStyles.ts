import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorBtn: { marginTop: 15, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },

  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 350, zIndex: 0 },
  coverImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },

  headerAbsolute: { position: 'absolute', top: 0, left: 0, zIndex: 100, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 10 : 0 },
  backButtonCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },

  scrollView: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },
  contentContainer: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -40, paddingHorizontal: 20, paddingBottom: 40, minHeight: height - 200, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  dragHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 20 },

  titleSection: { marginBottom: 20 },
  recipeTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 12, lineHeight: 32 },
  metaInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { marginLeft: 6, fontSize: 14, fontWeight: '500', color: '#555' },
  dividerVertical: { width: 1, height: 16, backgroundColor: '#DDD', marginRight: 20 },

  authorContainer: { flexDirection: 'row', alignItems: 'center' },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 1, borderColor: '#EEE' },
  defaultAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  defaultAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#757575' },
  authorLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#333' },

  separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },

  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  difficultyLabelText: { fontSize: 13, color: '#666' },
  descriptionText: { fontSize: 15, lineHeight: 24, color: '#444' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 13, fontWeight: '600' },

  ingredientBox: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE' },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#888', marginRight: 12 },
  ingredientName: { flex: 1, fontSize: 16, color: '#333' },
  ingredientQuantity: { fontSize: 16, fontWeight: '600', color: '#333', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },

  stepContainer: { marginBottom: 24 },
  stepTitleLabel: { fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  stepInstruction: { fontSize: 15, lineHeight: 24, color: '#444', marginBottom: 12 },
  stepImageScroll: { flexDirection: 'row' },
  stepImage: { width: 140, height: 100, borderRadius: 8, marginRight: 10, backgroundColor: '#F5F5F5' },
  emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
  },
  
  // Nút Chỉnh sửa (Style Xanh lá)
  editButton: {
    backgroundColor: '#8BC34A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },

  // Nút Yêu thích (Style Đen hoặc Hồng khi active)
  favoriteButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0F5', // Nền hồng nhạt
    borderWidth: 1,
    borderColor: '#FF4081',
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default styles;