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
  ActivityIndicator,
  Alert,
} from 'react-native';

// Import Service và Type
import { reportService, ReportTargetType, CreateReportRequest } from '../services/ReportService';

// Định nghĩa kiểu dữ liệu cho Props
interface ReportDialogProps {
  visible: boolean;
  reportedUser: string;
  targetId?: string;
  targetType?: ReportTargetType;
  onClose: () => void;
  onSubmit?: (reason: string) => Promise<void> | void;
  onSuccess?: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  visible,
  reportedUser,
  targetId,
  targetType,
  onClose,
  onSubmit,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate
    if (reason.trim().length < 5) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do cụ thể hơn (tối thiểu 5 ký tự).');
      return;
    }

    setLoading(true);

    try {
      // Ưu tiên: Nếu có onSubmit callback, gọi nó
      if (onSubmit) {
        await onSubmit(reason.trim());
        Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi đi.');
      } else if (targetId && targetType) {
        // Nếu không có callback, gọi API directly
        const requestData: CreateReportRequest = {
          targetId: targetId,
          targetType: targetType,
          description: reason.trim(),
        };

        const response = await reportService.createReport(requestData);
        Alert.alert('Thành công', response.message || 'Báo cáo của bạn đã được gửi đi.');
      } else {
        throw new Error('Thiếu thông tin báo cáo (targetId hoặc targetType)');
      }

      setReason('');
      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      const errorMsg = error.message || 'Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMsg);
      console.error('[Report Error]:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.dialogContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.flagIcon}>🚩</Text> 
                <Text style={styles.titleText}>Báo cáo vi phạm</Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.infoText}>
                Bạn đang báo cáo: <Text style={styles.boldText}>{reportedUser}</Text>
              </Text>

              <Text style={styles.label}>
                Mô tả lý do <Text style={styles.subLabel}>(bắt buộc)</Text>
              </Text>
              
              <View style={[styles.inputWrapper, loading && { backgroundColor: '#f5f5f5' }]}>
                <TextInput
                  style={styles.textInput}
                  multiline={true}
                  placeholder="Vui lòng mô tả chi tiết hành vi vi phạm..."
                  placeholderTextColor="#999"
                  value={reason}
                  onChangeText={setReason}
                  maxLength={2000}
                  editable={!loading}
                  textAlignVertical="top"
                />
              </View>
              
              <Text style={styles.counterText}>{reason.length}/2000</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.btnCancel} 
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnSubmit, loading && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                ) : (
                  <Text style={styles.flagIconBtn}>🚩</Text>
                )}
                <Text style={styles.btnSubmitText}>
                  {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    color: '#D32F2F',
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
    padding: Platform.OS === 'ios' ? 10 : 5,
    height: 120,
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
    gap: 10,
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
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center'
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