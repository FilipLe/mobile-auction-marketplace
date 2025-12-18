// File: app/edit-profile.tsx
// Functionality: handling form of editing a user profile
// Author: Nguyen Le


import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { API_BASE_URL } from '../services/api';

// profile interface
interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  bio_text: string;
}

export default function EditProfileScreen() {
  // variables to store state
  const router = useRouter();
  const { profile: authProfile, token, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bioText, setBioText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authProfile) {
      // set profile state from authProfile
      setProfile(authProfile);
      setBioText(authProfile.bio_text || '');
      setImage(authProfile.profile_image || null);
      setLoading(false);
    } else {
      // if no authProfile, stop loading
      setLoading(false);
    }
  }, [authProfile]);

  // handle image upload
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // construct full URL from relative path
    const baseUrl = API_BASE_URL.replace('/project', '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // handle saving updates
  const handleSave = async () => {
    // check if current user logged in
    if (!authProfile?.id || !token) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setSaving(true);
    try {
      // form data collection
      const formData = new FormData();
      formData.append('bio_text', bioText);
      
      // check if it's a newly uploaded local file
      if (image && image.startsWith('file://')) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // upload to form data
        formData.append('profile_image', {
          uri: image,
          name: filename || 'image.jpg',
          type,
        } as any);
      }

      // PATCH method with REST endpoint, which requires method, body, header
      const response = await fetch(`${API_BASE_URL}/api/profile/${authProfile.id}/`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      // successfully updated profile
      if (response.ok) {
        // refresh the profile in context
        await refreshProfile(); 
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        // failed to update
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      // error
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      // successful, save
      setSaving(false);
    }
  };

  
  // loading icon
  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.highlight} />
      </View>
    );
  }

  // no profile in context
  if (!profile || !authProfile) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={typography.body}>Profile not found</Text>
        <TouchableOpacity
          style={[commonStyles.button, { marginTop: spacing.md }]}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // render view for display
  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ padding: spacing.md }}>
        {/* title */}
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>
          Edit Profile
        </Text>

        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          {/* profile's profile image */}
          <Image
            source={{
              uri: image ? (image.startsWith('file://') ? image : getImageUrl(image)) : getImageUrl(profile.profile_image),
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: spacing.md,
            }}
          />
          {/* change photo button */}
          <TouchableOpacity
            style={commonStyles.buttonSecondary}
            onPress={pickImage}
          >
            <Text style={commonStyles.buttonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          {/* username */}
          <Text style={commonStyles.label}>Username</Text>
          <TextInput
            style={[commonStyles.input, { backgroundColor: colors.input, opacity: 0.6 }]}
            value={profile.username}
            editable={false}
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Username cannot be changed
          </Text>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          {/* bio text */}
          <Text style={commonStyles.label}>Bio</Text>
          <TextInput
            style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
            value={bioText}
            onChangeText={setBioText}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* save button */}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={commonStyles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* cancel button */}
        <TouchableOpacity
          style={[commonStyles.buttonSecondary, { marginTop: spacing.sm }]}
          onPress={() => router.back()}
        >
          <Text style={commonStyles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}