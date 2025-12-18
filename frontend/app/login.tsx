// File: app/login.tsx
// Functionality: handle login of an user
// Author: Nguyen Le


import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, commonStyles, spacing, typography } from '../assets/my_styles';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  // variables to store states
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // handle login 
  const handleLogin = async () => {
    // missing username/password
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    // await authentication of login credentials 
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      // on success, go to profile
      router.replace('/(tabs)/profile' as any);
    } else {
      // otherwise, error
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  // render view for display
  return (
    <View style={[commonStyles.container, { padding: spacing.md }]}>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Login</Text>

      {/* input username */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Username</Text>
        <TextInput
          style={commonStyles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {/* input password */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Password</Text>
        <TextInput
          style={commonStyles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
      </View>

      {/* login button */}
      <TouchableOpacity
        style={commonStyles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={commonStyles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* register button */}
      <TouchableOpacity
        style={{ marginTop: spacing.md }}
        onPress={() => router.push('/register' as any)}
      >
        <Text style={[typography.body, { color: colors.highlight, textAlign: 'center' }]}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}