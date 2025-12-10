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
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Implement authentication logic
    console.log('Login clicked', { email, password });
    navigation.navigate('CountryList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="admin-panel-settings" size={48} color={colors.primary} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Sign in to manage the system.</Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username or Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., admin@gov.country"
                  placeholderTextColor={colors.gray[400]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
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
                      size={24}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.primary + '1A', // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    color: colors.gray[700],
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: fontSizes.base,
    color: colors.gray[900],
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
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
