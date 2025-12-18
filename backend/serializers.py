# File: project/serializers.py
# Serializers for Django REST endpoints
# Author: Nguyen Le
# Description: App that incorporates React Native Frontend and Django REST Backend 
from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    '''Serializer for User model'''
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProfileSerializer(serializers.ModelSerializer):
    '''Serializer for Profile model'''
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_image', 'bio_text', 'join_date', 'user']
        read_only_fields = ['join_date']

class ItemSerializer(serializers.ModelSerializer):
    '''Serializer for Item model'''
    owner = ProfileSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), source='owner', write_only=True, required=False)
    num_bids = serializers.SerializerMethodField()
    current_bid = serializers.SerializerMethodField()
    time_left = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = ['id', 'owner', 'owner_id', 'title', 'description', 'item_image', 'starting_bid', 'listed_at', 'end_time', 'num_bids', 'current_bid', 'time_left']
        read_only_fields = ['listed_at']
    
    def get_num_bids(self, obj):
        '''return the number of bids for this item'''
        return obj.get_num_bids()
    
    def get_current_bid(self, obj):
        '''return the current highest bid'''
        return float(obj.get_current_bid())
    
    def get_time_left(self, obj):
        '''return the time left for the auction'''
        time_left = obj.get_time_left()
        if time_left == "Ended":
            return "Ended"
        return str(time_left)

class BidSerializer(serializers.ModelSerializer):
    '''Serializer for Bid model'''
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), source='item', write_only=True)
    bidder = ProfileSerializer(read_only=True)
    bidder_id = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), source='bidder', write_only=True, required=False)
    
    class Meta:
        model = Bid
        fields = ['id', 'item', 'item_id', 'bidder', 'bidder_id', 'bid_amount', 'timestamp']
        read_only_fields = ['timestamp']

class CommentSerializer(serializers.ModelSerializer):
    '''Serializer for Comment model'''
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), source='item', write_only=True)
    profile = ProfileSerializer(read_only=True)
    profile_id = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), source='profile', write_only=True, required=False)
    
    class Meta:
        model = Comment
        fields = ['id', 'item', 'item_id', 'profile', 'profile_id', 'text', 'timestamp']
        read_only_fields = ['timestamp']

class ReviewSerializer(serializers.ModelSerializer):
    '''Serializer for Review model'''
    reviewer = ProfileSerializer(read_only=True)
    reviewer_id = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), source='reviewer', write_only=True, required=False)
    reviewed_profile = ProfileSerializer(read_only=True)
    reviewed_profile_id = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), source='reviewed_profile', write_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewer_id', 'reviewed_profile', 'reviewed_profile_id', 'feedback', 'numerical_rating', 'timestamp']
        read_only_fields = ['timestamp']
    