// File: app/create-review.tsx
// Functionality: handling form of creating review
// Author: Nguyen Le


import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, commonStyles, spacing, typography } from '../assets/my_styles';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

export default function CreateReviewScreen() {
  // variables to store states 
  const { profile_id } = useLocalSearchParams();
  const router = useRouter();
  const { token, profile: currentProfile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // handle submission of review
  const handleSubmit = async () => {
    // havent entered feedback
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter feedback');
      return;
    }

    // not logged in
    if (!currentProfile?.id || !token) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);

    try {
      // POST response, which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          reviewed_profile_id: profile_id,
          reviewer_id: currentProfile.id,
          numerical_rating: rating,
          feedback: feedback,
        }),
      });

      // response received
      if (response.ok) {
        Alert.alert('Success', 'Review submitted successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      // error POST
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      // successful POST
      setLoading(false);
    }
  };

  // render view for display
  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ padding: spacing.md }}>
        {/* title of form */}
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>
          Leave a Review
        </Text>

        <View style={{ marginBottom: spacing.md }}>
          {/* numerical star rating */}
          <Text style={commonStyles.label}>Rating</Text>

          {/* selecting star rating */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => setRating(num)}
                style={{
                  padding: spacing.sm,
                  backgroundColor: rating === num ? colors.highlight : colors.input,
                  borderRadius: 8,
                  minWidth: 50,
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.h2, { color: colors.text }]}>{num} ⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          {/* text feedback */}
          <Text style={commonStyles.label}>Feedback</Text>

          {/* input text field */}
          <TextInput
            style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write your review..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* submit button */}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={commonStyles.buttonText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        {/* cancel review button */}
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