// File: app/(tabs)/create.tsx
// Functionality: input to collect new Auction Listing, using POST
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
import { colors, commonStyles, spacing, typography } from '../../assets/my_styles';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/api';

export default function CreateItemScreen() {
  // variables to store state   
  const router = useRouter();
  const { token, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endTime, setEndTime] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // handle image file upload
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // handling POST submission
  const handleSubmit = async () => {
    // check if user is logged in 
    if (!token || !profile) {
      Alert.alert('Error', 'You must be logged in to create an auction');
      router.push('/login' as any);
      return;
    }

    // check if any fields missing
    if (!title || !description || !startingBid || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // form data collection
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('starting_bid', startingBid);
      formData.append('end_time', endTime);
      formData.append('owner_id', profile.id.toString());
      
      // handle POST image 
      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('item_image', {
          uri: image,
          name: filename || 'image.jpg',
          type,
        } as any);
      }

      // POST response which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/items/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      // successful POST
      if (response.ok) {
        // alert to inform successful upload
        Alert.alert('Success', 'Item created successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/profile' as any),
          },
        ]);
        
        // reset form
        setTitle('');
        setDescription('');
        setStartingBid('');
        setEndTime('');
        setImage(null);
      } else {
        // failed to POST
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        Alert.alert('Error', errorData.error || errorData.detail || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // show login prompt if not logged in
  if (!token || !profile) {
    return (
      <View style={[commonStyles.container, commonStyles.center, { padding: spacing.md }]}>
        <Text style={[typography.h2, { marginBottom: spacing.md, textAlign: 'center' }]}>
          Please log in to create an auction
        </Text>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={commonStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // render view for display
  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ padding: spacing.md }}>
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>
          Create Auction
        </Text>

        {/* item title */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={commonStyles.label}>Title</Text>
          <TextInput
            style={commonStyles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter item title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* item description */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={commonStyles.label}>Description</Text>
          <TextInput
            style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter item description"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* item starting bid */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={commonStyles.label}>Starting Bid ($)</Text>
          <TextInput
            style={commonStyles.input}
            value={startingBid}
            onChangeText={setStartingBid}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* item bidding end time */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={commonStyles.label}>End Time (YYYY-MM-DDTHH:MM)</Text>
          <TextInput
            style={commonStyles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="2024-12-31T23:59"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* image of item */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={commonStyles.label}>Item Image</Text>
          {/* call the upload image functionality */}
          <TouchableOpacity
            style={[
              commonStyles.buttonSecondary,
              { marginBottom: spacing.sm },
            ]}
            onPress={pickImage}
          >
            <Text style={commonStyles.buttonText}>Pick Image</Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginTop: spacing.sm,
              }}
              resizeMode="cover"
            />
          )}
        </View>

        {/* submit */}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={commonStyles.buttonText}>Create Auction</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}