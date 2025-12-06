import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Màu nền sáng nhẹ
  },
  
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    // Shadow nhẹ cho header
    shadowColor: '#000',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  iconButton: {
    padding: 5,
  },

  // --- Body Styles ---
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'space-between', // Đẩy actionContainer xuống dưới cùng
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  subtitleText: {
    fontSize: 15,
    color: '#8F9BB3', // Màu xám mờ
    textAlign: 'center',
    lineHeight: 22,
  },

  // --- Scan Area Styles ---
  scanAreaWrapper: {
    width: '100%',
    aspectRatio: 1, // Tỷ lệ vuông
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedBox: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#8BC34A', // Màu xanh chủ đạo
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: '#F1F8E9', // Xanh rất nhạt
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#8BC34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scanHintText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8BC34A',
  },
  scanSubHint: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  // --- Image Preview Styles ---
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.8)', // Màu đỏ đậm
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },

  // --- Error & Action Styles ---
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    fontSize: 14,
  },
  actionContainer: {
    width: '100%',
    marginBottom: 30,
    marginTop: 20,
    gap: 15, 
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginLeft: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#8BC34A', // Màu chủ đạo
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8BC34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#BDBDBD', 
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;