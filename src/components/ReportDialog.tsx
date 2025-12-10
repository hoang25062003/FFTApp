import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';

// Định nghĩa kiểu dữ liệu cho Props
interface ReportDialogProps {
  visible: boolean;             // Trạng thái hiển thị (ẩn/hiện)
  reportedUser: string;         // Tên người bị báo cáo
  onClose: () => void;          // Hàm xử lý khi đóng dialog
  onSubmit: (reason: string) => void; // Hàm xử lý khi nhấn Gửi
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  visible,
  reportedUser,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    // Có thể thêm validate ở đây nếu cần
    onSubmit(reason);
    setReason(''); // Reset form sau khi gửi
  };

  const handleClose = () => {
    setReason(''); // Reset form khi hủy
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose} // Xử lý nút Back cứng trên Android
    >
      {/* TouchableWithoutFeedback để đóng bàn phím khi bấm ra ngoài dialog */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* Main Container của Dialog */}
          <View style={styles.dialogContainer}>
            
            {/* Header: Tiêu đề + Nút đóng */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {/* Bạn có thể thay text này bằng Icon thư viện (vd: MaterialIcons) */}
                <Text style={styles.flagIcon}>🚩</Text> 
                <Text style={styles.titleText}>Báo cáo Người dùng</Text>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body: Thông tin người dùng + Input */}
            <View style={styles.body}>
              <Text style={styles.infoText}>
                Bạn đang báo cáo: <Text style={styles.boldText}>{reportedUser}</Text>
              </Text>

              <Text style={styles.label}>Mô tả <Text style={styles.subLabel}>(không bắt buộc)</Text></Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  multiline={true}
                  placeholder="Vui lòng mô tả lý do bạn báo cáo..."
                  placeholderTextColor="#999"
                  value={reason}
                  onChangeText={setReason}
                  maxLength={2000}
                  textAlignVertical="top" // Quan trọng cho Android để text bắt đầu từ trên cùng
                />
              </View>
              
              <Text style={styles.counterText}>{reason.length}/2000</Text>
            </View>

            {/* Footer: Các nút bấm */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.btnCancel} onPress={handleClose}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
                <Text style={styles.flagIconBtn}>🚩</Text>
                <Text style={styles.btnSubmitText}>Gửi báo cáo</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền mờ đen
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Elevation cho Android
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 18,
    color: '#D32F2F', // Màu đỏ giống ảnh
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeIcon: {
    fontSize: 20,
    color: '#999',
  },
  body: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontWeight: '400',
    color: '#999',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 10 : 5, // iOS cần padding nhiều hơn chút
    height: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  counterText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10, // Khoảng cách giữa 2 nút
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  btnCancelText: {
    color: '#333',
    fontWeight: '600',
  },
  btnSubmit: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#D32F2F', // Màu đỏ chủ đạo
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIconBtn: {
    color: '#fff',
    marginRight: 5,
    fontSize: 12,
  },
  btnSubmitText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReportDialog;