// File: app/profile-detail.tsx
// Functionality: detail view of a user profile
// Author: Nguyen Le


import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, commonStyles, spacing, typography } from '../assets/my_styles';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

// user interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// profile interface
interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  bio_text: string;
  join_date: string;
  user?: User; 
}

// item interface
interface Item {
  id: number;
  title: string;
  item_image: string;
  current_bid: number;
}

// review interface
interface Review {
  id: number;
  numerical_rating: number;
  feedback: string;
  reviewer: {
    username: string;
  };
  timestamp: string;
}

export default function ProfileDetailScreen() {
  // variables to store state
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // handle back navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // if no history, navigate to home tab
      router.replace('/(tabs)/items' as any);
    }
  };

  // on load retrieve profile and the profile's listed items and reviews
  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchItems();
      fetchReviews();
    }
  }, [id]);

  // handle retrieve profile from endpoint
  const fetchProfile = async () => {
    try {
      // GET from django REST
      const response = await fetch(`${API_BASE_URL}/api/profile/${id}/`);

      // retrieve json representation
      const data = await response.json();

      // set state
      setProfile(data);
    } catch (error) {
      // error GET
      console.error('Error fetching profile:', error);
    } finally {
      // GET successful
      setLoading(false);
    }
  };

  // handle retrieve items from endpoint
  const fetchItems = async () => {
    try {
      // GET from django REST
      const response = await fetch(`${API_BASE_URL}/api/profile/${id}/items/`);

      // retrieve json representation
      const data = await response.json();

      // set state 
      setItems(data);
    } catch (error) {
      // GET error
      console.error('Error fetching items:', error);
    }
  };

  // handle retrieve reviews from endpoint
  const fetchReviews = async () => {
    try {
      // GET from django REST
      const response = await fetch(`${API_BASE_URL}/api/profile/${id}/reviews/`);

      // retrieve json representation
      const data = await response.json();

      // set state
      setReviews(data);
      
      // calculate average rating
      if (data && data.length > 0) {
        const sum = data.reduce((acc: number, review: Review) => acc + review.numerical_rating, 0);
        setAverageRating(sum / data.length);
      } else {
        setAverageRating(null);
      }
    } catch (error) {
      // error GET
      console.error('Error fetching reviews:', error);
    } finally {
      // GET succeeded
      setRefreshing(false);
    }
  };

  // allow refresh to fetch
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchItems();
    fetchReviews();
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

  // check if viewing own profile
  const isOwnProfile = currentUser && profile && profile.user && currentUser.id === profile.user.id;

  // loading icon
  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.highlight} />
      </View>
    );
  }

  // no profile found
  if (!profile) {
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

  // render views for display
  return (
    <View style={commonStyles.container}>
      {/* back button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        paddingTop: spacing.lg,
        backgroundColor: colors.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ 
            marginRight: spacing.md,
            padding: spacing.xs,
            minWidth: 44,
            minHeight: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, { flex: 1 }]}>Profile</Text>
      </View>

      <ScrollView
        style={{flex:1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.highlight}
          />
        }
      >
        <View style={{ padding: spacing.md }}>
          <View style={[commonStyles.card, { alignItems: 'center', marginBottom: spacing.lg }]}>
            {/* profile image */}
            <Image
              source={{ uri: getImageUrl(profile.profile_image) }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: spacing.md,
              }}
            />

            {/* profile first and last name */}
            <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
              {profile.first_name} {profile.last_name}
            </Text>

            {/* profile username */}
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              @{profile.username}
            </Text>
            
            {/* average rating */}
            {averageRating !== null ? (
              <View style={{ marginBottom: spacing.sm }}>
                {/* stars */}
                <Text style={[typography.body, { color: colors.highlight }]}>
                  ⭐ {averageRating.toFixed(1)}/5.0
                </Text>

                {/* reviews */}
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : (
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                No ratings yet
              </Text>
            )}
            
            {/* profile bio text */}
            {profile.bio_text && (
              <Text style={[typography.bodySmall, { textAlign: 'center' }]}>
                {profile.bio_text}
              </Text>
            )}

            {/* profile join date */}
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>
              Joined: {new Date(profile.join_date).toLocaleDateString()}
            </Text>
          </View>

          {/* leave review button, check not own profile and logged in */}
          {!isOwnProfile && currentUser && (
            <TouchableOpacity
              style={[commonStyles.button, { marginBottom: spacing.md }]}
              onPress={() => router.push(`/create-review?profile_id=${profile.id}` as any)}
            >
              <Text style={commonStyles.buttonText}>Leave Review</Text>
            </TouchableOpacity>
          )}

          {/* profile's auctions */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Auctions ({items.length})
            </Text>
            {items.length === 0 ? (
              // no auctions
              <View style={[commonStyles.center, { padding: spacing.xl }]}>
                <Ionicons name="hammer-outline" size={48} color={colors.textSecondary} />
                <Text style={[typography.body, { marginTop: spacing.md, color: colors.textSecondary }]}>
                  No items listed yet
                </Text>
              </View>
            ) : (
              // many auctions
              items.map((item) => (
                // card of item auction listing
                <TouchableOpacity
                  key={item.id}
                  style={commonStyles.card}
                  onPress={() => router.push(`/item-detail?id=${item.id}` as any)}
                >
                  {/* item image */}
                  <Image
                    source={{ uri: getImageUrl(item.item_image) }}
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 8,
                      marginBottom: spacing.sm,
                    }}
                    resizeMode="cover"
                  />

                  {/* item title */}
                  <Text style={[typography.h3, { marginBottom: spacing.xs }]}>
                    {item.title}
                  </Text>

                  {/* item current bid */}
                  <Text style={[typography.body, { color: colors.highlight }]}>
                    Current: ${item.current_bid?.toLocaleString() || '0'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* profile reviews */}
          <View style={commonStyles.card}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Reviews ({reviews.length})
            </Text>
            {reviews.length === 0 ? (
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                No reviews yet
              </Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={{ marginBottom: spacing.md }}>
                  <View style={commonStyles.spaceBetween}>
                    {/* reviewer username */}
                    <Text style={[typography.body, { fontWeight: '600' }]}>
                      @{review.reviewer.username}
                    </Text>

                    {/* reviewer rating stars given */}
                    <Text style={[typography.body, { color: colors.highlight }]}>
                      {review.numerical_rating}/5 ⭐
                    </Text>
                  </View>

                  {/* review feedback */}
                  <Text style={typography.bodySmall}>{review.feedback}</Text>

                  {/* review time */}
                  <Text style={typography.caption}>{review.timestamp}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}