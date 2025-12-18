// File: app/(tabs)/profile.tsx
// Functionality: current user's profile
// Author: Nguyen Le


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, commonStyles, spacing, typography } from '../../assets/my_styles';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/api';

// profile interface
interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  bio_text: string;
}

// item interface
interface Item {
  id: number;
  title: string;
  item_image: string;
  current_bid: number;
}

export default function ProfileScreen() {
  // variables to store state
  const router = useRouter();
  const { profile: authProfile, user, token, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // check for authentication, see if profile is logged in
  useEffect(() => {
    if (authProfile) {
      // logged in
      setProfile(authProfile);
      fetchItems();
    } else {
      // not logged in
      setLoading(false);
    }
  }, [authProfile]);

  // fetch current profile's listed items
  const fetchItems = async () => {
    // check authentication
    if (!authProfile?.id || !token) {
      setLoading(false);
      return;
    }

    // GET profile
    try {
      // GET from django REST and authentication token
      const response = await fetch(`${API_BASE_URL}/api/profile/${authProfile.id}/items/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      // json representation 
      const data = await response.json();

      // set state
      setItems(data);
    } catch (error) {
      // GET error
      console.error('Error fetching items:', error);
    } finally {
      // GET succeeded
      setLoading(false);
      setRefreshing(false);
    }
  };

  // enable refresh reload
  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // handle log out profile
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
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

  // loading icon
  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.highlight} />
      </View>
    );
  }

  // if no auth profile found (not logged in)
  if (!profile) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={typography.body}>Please log in to view your profile</Text>
        <TouchableOpacity
          style={[commonStyles.button, { marginTop: spacing.md }]}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={commonStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // render view for display
  return (
    // scroll view to scroll through auctions and reviews left on profile's account
    <ScrollView
      style={commonStyles.container}
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
          {/* profile picture */}
          <Image
            source={{ uri: getImageUrl(profile?.profile_image) }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: spacing.md,
            }}
          />

          {/* profile first and last name */}
          <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
            {profile?.first_name} {profile?.last_name}
          </Text>

          {/* username */}
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            @{profile?.username}
          </Text>

          {/* optional bio text */}
          {profile?.bio_text && (
            <Text style={[typography.bodySmall, { textAlign: 'center' }]}>
              {profile.bio_text}
            </Text>
          )}
        </View>

        {/* edit profile for authenticated user */}
        <TouchableOpacity
          style={[commonStyles.button, { marginBottom: spacing.sm }]}
          onPress={() => router.push('/edit-profile' as any)}
        >
          <Text style={commonStyles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* log out for authenticated user */}
        <TouchableOpacity
          style={[commonStyles.buttonSecondary, { marginBottom: spacing.md }]}
          onPress={handleLogout}
        >
          <Text style={commonStyles.buttonText}>Logout</Text>
        </TouchableOpacity>

        {/* list of auctions posted by this profile */}
        <View style={{ marginBottom: spacing.md }}>
          {/* title + count  */}
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>
            My Auctions ({items.length})
          </Text>
          {items.length === 0 ? (
            // profile has not listed any auctions
            <View style={[commonStyles.center, { padding: spacing.xl }]}>
              <Ionicons name="hammer-outline" size={48} color={colors.textSecondary} />
              <Text style={[typography.body, { marginTop: spacing.md, color: colors.textSecondary }]}>
                No items listed yet
              </Text>
            </View>
          ) : (
            // profile has listed auctions
            items.map((item) => (
              // card of item auction listing  
              <TouchableOpacity
                key={item.id}
                style={commonStyles.card}
                onPress={() => router.push(`/item-detail?id=${item.id}` as any)}
              >
                {/* item's image */}
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

                {/* item's title */}
                <Text style={[typography.h3, { marginBottom: spacing.xs }]}>
                  {item.title}
                </Text>

                {/* item's current bid */}
                <Text style={[typography.body, { color: colors.highlight }]}>
                  Current: ${item.current_bid?.toLocaleString() || '0'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}