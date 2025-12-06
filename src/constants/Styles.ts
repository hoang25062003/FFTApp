import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 250, // Điều chỉnh kích thước tùy theo asset thực tế
    height: 125, // Điều chỉnh kích thước
    resizeMode: 'contain',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});