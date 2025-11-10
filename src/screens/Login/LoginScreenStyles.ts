import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors'; // Đảm bảo đường dẫn này đúng

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  errorText: { // Style mới cho thông báo lỗi
    fontSize: 14,
    color: Colors.error, // Giả sử bạn có Colors.error
    marginBottom: 10,
    textAlign: 'left',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5, // Điều chỉnh để cách xa input/error
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 5,
  },
  loginButton: {
    marginTop: 0,
    marginBottom: 20,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.separator,
  },
  separatorText: {
    marginHorizontal: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 5,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default styles;