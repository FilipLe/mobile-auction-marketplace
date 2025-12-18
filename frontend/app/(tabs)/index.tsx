// File: app/(tabs)/index.tsx
// Functionality: display auctions that are still active, using GET
// Author: Nguyen Le


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { colors, commonStyles, spacing, typography } from '../../assets/my_styles';
import { API_BASE_URL } from '../../services/api';

// item interface
interface Item {
  id: number;
  title: string;
  item_image: string;
  current_bid: number;
  time_left: string;
  owner: {
    username: string;
  };
}

export default function HomeScreen() {
  // variables to store states
  const router = useRouter();
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // GET to retrieve active auction items
  const fetchFeaturedItems = async () => {
    try {
      // GET from django REST
      const response = await fetch(`${API_BASE_URL}/api/items/featured/`);
      
      // retrieve Json representation
      const data = await response.json();

      // set state
      setFeaturedItems(data);
    } catch (error) {
      // GET error
      console.error('Error fetching featured items:', error);
    } finally {
      // GET succeeded
      setLoading(false);
      setRefreshing(false);
    }
  };

  // fetch active auction items on reload
  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeaturedItems();
  };

  // helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300';
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

  // render views to display
  return (
    <View style={commonStyles.container}>
      {/* title and headings */}
      <View style={{ padding: spacing.md, backgroundColor: colors.secondary }}>
        <Text style={[typography.h1, { marginBottom: spacing.sm }]}>
          Featured Auctions
        </Text>
        <Text style={typography.bodySmall}>
          Discover the hottest auctions ending soon
        </Text>
      </View>

      {/* scrollview to scroll through active listing */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.highlight}
          />
        }
      >
        {featuredItems.length === 0 ? (
          // if there is all auctions expired
          <View style={[commonStyles.center, { padding: spacing.xl }]}>
            <Ionicons name="hammer-outline" size={64} color={colors.textSecondary} />
            <Text style={[typography.body, { marginTop: spacing.md, color: colors.textSecondary }]}>
              No active auctions at the moment
            </Text>
          </View>
        ) : (
          // if there exists active auction
          featuredItems.map((item) => (
            // cards of auction listing
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
                  height: 200,
                  borderRadius: 8,
                  marginBottom: spacing.md,
                }}
                resizeMode="cover"
              />

              {/* item's title */}
              <Text style={[typography.h3, { marginBottom: spacing.sm }]}>
                {item.title}
              </Text>

              {/* item's current bid and time left to bid */}
              <View style={commonStyles.spaceBetween}>
                <View>
                  <Text style={typography.caption}>Current Bid</Text>
                  <Text style={[typography.h2, { color: colors.highlight }]}>
                    ${item.current_bid?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={typography.caption}>Time Left</Text>
                  <Text style={[typography.body, { color: colors.success }]}>
                    {item.time_left || 'Unknown'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}