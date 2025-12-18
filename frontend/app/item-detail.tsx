// File: app/item-detail.tsx
// Functionality: detail view of an auctioned item
// Author: Nguyen Le


import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

// item interface
interface Item {
  id: number;
  title: string;
  description: string;
  item_image: string;
  starting_bid: number;
  current_bid: number;
  num_bids: number;
  time_left: string;
  owner: {
    id: number;
    username: string;
  };
}

// bid interface
interface Bid {
  id: number;
  bid_amount: number;
  bidder: {
    username: string;
  };
  timestamp: string;
}

// comment interface
interface Comment {
  id: number;
  text: string;
  profile: {
    username: string;
  };
  timestamp: string;
}

export default function ItemDetailScreen() {
  // variables to store states
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, profile: currentProfile } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [commentText, setCommentText] = useState('');

  // handle back navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/items' as any);
    }
  };

  // on load fetch item, bid, comment
  useEffect(() => {
    fetchItem();
    fetchBids();
    fetchComments();
  }, [id]);

  // GET item
  const fetchItem = async () => {
    try {
      // GET from REST endpoint
      const response = await fetch(`${API_BASE_URL}/api/item/${id}/`);

      // retrieve json representation
      const data = await response.json();

      // set state
      setItem(data);
    } catch (error) {
      // error GET
      console.error('Error fetching item:', error);
    } finally {
      // successful GET
      setLoading(false);
    }
  };

  // GET bids
  const fetchBids = async () => {
    try {
      // GET from REST endpoint
      const response = await fetch(`${API_BASE_URL}/api/item/${id}/bids/`);

      // retrieve json representation
      const data = await response.json();

      // set state
      setBids(data);
    } catch (error) {
      // error GET
      console.error('Error fetching bids:', error);
    }
  };

  // GET commment
  const fetchComments = async () => {
    try {
      // GET from REST endpoint
      const response = await fetch(`${API_BASE_URL}/api/item/${id}/comments/`);

      // retrieve json representation
      const data = await response.json();

      // set state
      setComments(data);
    } catch (error) {
      // error GET
      console.error('Error fetching comments:', error);
    }
  };

  // helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/400';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // construct full URL from relative path
    const baseUrl = API_BASE_URL.replace('/project', '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // handle bid placement
  const handleBid = async () => {
    // not logged in
    if (!token || !currentProfile) {
      Alert.alert('Error', 'You must be logged in to place a bid');
      router.push('/login' as any);
      return;
    }

    // bid amount is lower than current highest bid
    if (!bidAmount || parseFloat(bidAmount) <= item!.current_bid) {
      Alert.alert('Error', 'Bid must be higher than current bid');
      return;
    }

    try {
      // POST response, which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/bids/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          item_id: id,
          bid_amount: bidAmount,
          bidder_id: currentProfile.id,
        }),
      });

      // bid successfully
      if (response.ok) {
        Alert.alert('Success', 'Bid placed successfully!');
        setBidAmount('');
        fetchItem();
        fetchBids();
      } else {
        // bid failed
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to place bid');
      }
    } catch (error) {
      // error POST
      console.error('Error placing bid:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // handle comment submission
  const handleComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    // not logged in
    if (!token || !currentProfile) {
      Alert.alert('Error', 'You must be logged in to post a comment');
      router.push('/login' as any);
      return;
    }

    try {
      // POST response, which requires method, header, body
      const response = await fetch(`${API_BASE_URL}/api/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          item_id: id,
          text: commentText,
          profile_id: currentProfile.id,
        }),
      });

      // posted comment successfully
      if (response.ok) {
        setCommentText('');
        fetchComments();
      } else {
        // post comment failed
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to post comment');
      }
    } catch (error) {
      // error POST
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Something went wrong');
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

  // item not found
  if (!item) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={typography.body}>Item not found</Text>
      </View>
    );
  }

  // render view for display
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
        <Text style={[typography.h2, { flex: 1 }]}>Auction Details</Text>
      </View>

      <ScrollView style={{flex:1}}>
        <View style={{ padding: spacing.md }}>
          {/* item's image */}
          <Image
            source={{ uri: getImageUrl(item.item_image) }}
            style={{
              width: '100%',
              height: 300,
              borderRadius: 12,
              marginBottom: spacing.md,
            }}
            resizeMode="cover"
          />

          {/* item's title */}
          <Text style={[typography.h1, { marginBottom: spacing.sm }]}>
            {item.title}
          </Text>

          {/* clickable link to seller username */}
          <TouchableOpacity
            onPress={() => router.push(`/profile-detail?id=${item.owner.id}` as any)}
            style={{ marginBottom: spacing.md }}
          >
            <Text style={[typography.body, { color: colors.highlight }]}>
              Seller: @{item.owner.username}
            </Text>
          </TouchableOpacity>

          {/* item's current bid and bidding time left */}
          <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
            <View style={commonStyles.spaceBetween}>
              {/* current bid */}
              <View>
                <Text style={typography.caption}>Current Bid</Text>
                <Text style={[typography.h1, { color: colors.highlight }]}>
                  ${item.current_bid?.toLocaleString() || '0'}
                </Text>
              </View>

              {/* time left */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={typography.caption}>Time Left</Text>
                <Text style={[typography.h2, { color: colors.success }]}>
                  {item.time_left || 'Unknown'}
                </Text>
              </View>
            </View>
            <View style={commonStyles.divider} />

            {/* starting bid */}
            <Text style={typography.bodySmall}>
              Starting Bid: ${item.starting_bid?.toLocaleString() || '0'} • {item.num_bids || 0} bids
            </Text>
          </View>

          <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
            <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Description</Text>
            <Text style={typography.body}>{item.description}</Text>
          </View>

          {/* only show bid form if user is logged in and not the owner */}
          {token && currentProfile && currentProfile.id !== item.owner.id && (
            <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
              <Text style={[typography.h3, { marginBottom: spacing.md }]}>Place Bid</Text>
              <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
                <TextInput
                  style={[commonStyles.input, { flex: 1, marginRight: spacing.sm }]}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  placeholder="Enter bid amount"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity style={commonStyles.button} onPress={handleBid}>
                  <Text style={commonStyles.buttonText}>Bid</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* show login prompt if not logged in */}
          {!token && (
            <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
              <Text style={typography.bodySmall}>Please log in to place a bid</Text>
              <TouchableOpacity
                style={[commonStyles.button, { marginTop: spacing.sm }]}
                onPress={() => router.push('/login' as any)}
              >
                <Text style={commonStyles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* show all bids */}
          <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Bids ({bids.length})
            </Text>
            {bids.length === 0 ? (
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                No bids yet
              </Text>
            ) : (
              bids.map((bid) => (
                <View key={bid.id} style={{ marginBottom: spacing.sm }}>
                  <View style={commonStyles.spaceBetween}>
                    <Text style={typography.body}>@{bid.bidder.username}</Text>
                    <Text style={[typography.body, { color: colors.highlight }]}>
                      ${bid.bid_amount?.toLocaleString() || '0'}
                    </Text>
                  </View>
                  <Text style={typography.caption}>{bid.timestamp}</Text>
                </View>
              ))
            )}
          </View>

          {/* comment section */}
          <View style={commonStyles.card}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>
              Comments ({comments.length})
            </Text>
            
            {/* comment input - only show if logged in */}
            {token && currentProfile ? (
              <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                <TextInput
                  style={[commonStyles.input, { flex: 1, marginRight: spacing.sm }]}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <TouchableOpacity style={commonStyles.button} onPress={handleComment}>
                  <Ionicons name="send" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[commonStyles.buttonSecondary, { marginBottom: spacing.md }]}
                onPress={() => router.push('/login' as any)}
              >
                <Text style={commonStyles.buttonText}>Login to Comment</Text>
              </TouchableOpacity>
            )}

            {comments.length === 0 ? (
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                No comments yet
              </Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={{ marginBottom: spacing.md }}>
                  <View style={commonStyles.spaceBetween}>
                    <Text style={[typography.body, { fontWeight: '600' }]}>
                      @{comment.profile.username}
                    </Text>
                    <Text style={typography.caption}>{comment.timestamp}</Text>
                  </View>
                  <Text style={typography.bodySmall}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}