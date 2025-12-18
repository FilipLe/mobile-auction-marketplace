// File: app/(tabs)/items.tsx
// Functionality: display a listing of auctions, including active and expired
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
    TextInput,
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
  starting_bid: number;
  current_bid: number;
  num_bids: number;
  time_left: string;
  owner: {
    username: string;
  };
}

export default function ItemsScreen() {
  // variables to store states
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // GET to retrieve all auctioned items
  const fetchItems = async () => {
    try {
      // GET from django REST
      const response = await fetch(`${API_BASE_URL}/api/items/`);

      // retrieve Json representation
      const data = await response.json();

      // set states, handle paginated response from API
      setItems(data.results || data || []);

    } catch (error) {
      // GET error
      console.error('Error fetching items:', error);
      setItems([]); 
    } finally {
      // GET succeeded
      setLoading(false);
      setRefreshing(false);
    }
  };

  // fetch all auctions on reload
  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // safety check to ensure items always an array
  const filteredItems = (items || []).filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <View style={{ padding: spacing.md, backgroundColor: colors.secondary }}>
        <Text style={[typography.h1, { marginBottom: spacing.md }]}>
          All Auctions
        </Text>
        {/* search bar functionality */}
        <View style={{ position: 'relative' }}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={{ position: 'absolute', left: spacing.md, top: 14, zIndex: 1 }}
          />
          {/* search input field */}
          <TextInput
            style={[
              commonStyles.input,
              { paddingLeft: spacing.xl + spacing.md },
            ]}
            placeholder="Search auctions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* scrollview to scroll through all listings */}
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
        {filteredItems.length === 0 ? (
          // no listings
          <View style={[commonStyles.center, { padding: spacing.xl }]}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={[typography.body, { marginTop: spacing.md, color: colors.textSecondary }]}>
              {searchQuery ? 'No items found' : 'No items available'}
            </Text>
          </View>
        ) : (
          // there are listings
          filteredItems.map((item) => (
            // card of item auction listing
            <TouchableOpacity
              key={item.id}
              style={commonStyles.card}
              onPress={() => router.push(`/item-detail?id=${item.id}` as any)}
            >
              <View style={{ flexDirection: 'row' }}>
                {/* item's image */}
                <Image
                  source={{ uri: item.item_image || 'https://via.placeholder.com/150' }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    marginRight: spacing.md,
                  }}
                  resizeMode="cover"
                />
                {/* item's basic information */}
                <View style={{ flex: 1 }}>
                  {/* item's title */}
                  <Text style={[typography.h3, { marginBottom: spacing.xs }]} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {/* username that listed the item auction */}
                  <Text style={[typography.caption, { marginBottom: spacing.sm }]}>
                    @{item.owner?.username || 'Unknown'}
                  </Text>

                  {/* item's current bid */}
                  <View style={{ marginBottom: spacing.sm }}>
                    <Text style={typography.caption}>Current Bid</Text>
                    <Text style={[typography.h2, { color: colors.highlight }]}>
                      ${item.current_bid?.toLocaleString() || '0'}
                    </Text>
                  </View>

                  {/* item's total number of bids and item's auction time left */}
                  <View style={commonStyles.spaceBetween}>
                    <View>
                      <Text style={typography.caption}>{item.num_bids || 0} bids</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.caption, { color: colors.success }]}>
                        {item.time_left || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}