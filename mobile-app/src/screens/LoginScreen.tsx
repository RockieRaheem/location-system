import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    // Simple authentication - in production, use proper auth
    if (email === 'admin@uganda.gov' && password === 'admin123') {
      setTimeout(() => {
        setLoading(false);
        navigation.replace('AdminDashboard');
      }, 500);
    } else {
      setTimeout(() => {
        setLoading(false);
        showAlert('Error', 'Invalid credentials. Use:\nEmail: admin@uganda.gov\nPassword: admin123');
      }, 500);
    }
  };

  const handleViewPublicData = () => {
    navigation.replace('ReadOnlyView');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="location-city" size={56} color={colors.primary[500]} />
            </View>
            <Text style={styles.appTitle}>🇺🇬 Uganda Location System</Text>
            <Text style={styles.appSubtitle}>Administrative Hierarchy Management</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="admin-panel-settings" size={32} color={colors.primary[500]} />
              <Text style={styles.title}>Administrator Login</Text>
            </View>

            <Text style={styles.subtitle}>Sign in to manage administrative units</Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="admin@uganda.gov"
                    placeholderTextColor={colors.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <MaterialIcons name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={22}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hint */}
              <View style={styles.hintBox}>
                <MaterialIcons name="info-outline" size={18} color={colors.primary[600]} />
                <Text style={styles.hintText}>
                  Demo credentials: admin@uganda.gov / admin123
                </Text>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>Signing in...</Text>
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color={colors.white} />
                  <Text style={styles.loginButtonText}>Sign In as Admin</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Public View Button */}
          <TouchableOpacity style={styles.publicButton} onPress={handleViewPublicData}>
            <MaterialIcons name="public" size={22} color={colors.primary[600]} />
            <Text style={styles.publicButtonText}>View Public Data</Text>
            <Text style={styles.publicButtonSubtext}>(No login required)</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[50],
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0px 8px 20px rgba(19, 91, 236, 0.15)',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },

  // Login Card
  loginCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 28,
  },

  // Form
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.gray[900],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.gray[900],
  },
  eyeIcon: {
    padding: 4,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  hintText: {
    fontSize: 13,
    color: colors.primary[700],
    flex: 1,
  },

  // Buttons
  loginButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },

  // Public Button
  publicButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary[300],
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  publicButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
  publicButtonSubtext: {
    fontSize: 13,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: fontSizes.base,
    color: colors.gray[900],
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  loginButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  forgotPassword: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },
});
