// File: app/register.tsx
// Functionality: handle registration of an user
// Author: Nguyen Le


import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, commonStyles, spacing, typography } from '../assets/my_styles';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  // variables to store state
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [profile_username, setProfile_username] = useState('');
  const [bio_text, setBio_text] = useState('');
  const [profile_image, setProfile_image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // handle image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfile_image(result.assets[0].uri);
    }
  };

  // handle registration
  const handleRegister = async () => {
    // missing credentials
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // confirm password
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // check password length
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // await authentication of credentials 
    setLoading(true);
    const success = await register(username, email, password, {
      first_name,
      last_name,
      username: profile_username || username,
      bio_text,
      profile_image, 
    });
    setLoading(false);

    if (success) {
      // on success, go to profile
      router.replace('/(tabs)/profile' as any);
    } else {
      // otherwise, error
      Alert.alert('Error', 'Registration failed. Username or email may already be taken.');
    }
  };

  // render views for display
  return (
    <ScrollView style={[commonStyles.container, { padding: spacing.md }]}>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Register</Text>

      {/* username */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Username *</Text>
        <TextInput
          style={commonStyles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {/* email */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Email *</Text>
        <TextInput
          style={commonStyles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* password */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Password *</Text>
        <TextInput
          style={commonStyles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password (min 8 characters)"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
      </View>

      {/* confirm password */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Confirm Password *</Text>
        <TextInput
          style={commonStyles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
      </View>

      {/* first name */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>First Name</Text>
        <TextInput
          style={commonStyles.input}
          value={first_name}
          onChangeText={setFirst_name}
          placeholder="Enter first name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* last name */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Last Name</Text>
        <TextInput
          style={commonStyles.input}
          value={last_name}
          onChangeText={setLast_name}
          placeholder="Enter last name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* username */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Profile Username</Text>
        <TextInput
          style={commonStyles.input}
          value={profile_username}
          onChangeText={setProfile_username}
          placeholder="Leave empty to use account username"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {/* profile picture */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Profile Picture</Text>
        <TouchableOpacity
          style={[commonStyles.buttonSecondary, { marginBottom: spacing.sm }]}
          onPress={pickImage}
        >
          <Text style={commonStyles.buttonText}>Pick Profile Picture</Text>
        </TouchableOpacity>
        {profile_image && (
          <Image
            source={{ uri: profile_image }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginTop: spacing.sm,
            }}
            resizeMode="cover"
          />
        )}
      </View>

      {/* bio text */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={commonStyles.label}>Bio</Text>
        <TextInput
          style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
          value={bio_text}
          onChangeText={setBio_text}
          placeholder="Tell us about yourself..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>

      {/* register button */}
      <TouchableOpacity
        style={commonStyles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={commonStyles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* login option */}
      <TouchableOpacity
        style={{ marginTop: spacing.md }}
        onPress={() => router.push('/login' as any)}
      >
        <Text style={[typography.body, { color: colors.highlight, textAlign: 'center' }]}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}