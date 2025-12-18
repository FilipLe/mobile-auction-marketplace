# File: project/views.py
# Views for mobile auction marketplace app
# Author: Nguyen Le
# Description: App that incorporates React Native Frontend and Django REST Backend 
from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
from django.urls import reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.utils import timezone
from .models import *
from .forms import *

# Custom LoginRequiredMixin
class MyLoginRequiredMixin(LoginRequiredMixin):
    '''Define a custom subclass LoginRequiredMixin as helper to force login for certain views'''
    
    def get_login_url(self):
        '''return the URL for this app's login page when unauthenticated'''
        current_url = self.request.get_full_path()
        login_url = reverse('login')
        return f"{login_url}?next={current_url}"
    
    def get_logged_in_profile(self):
        '''return the Profile of logged in user'''
        user = self.request.user
        try:
            return Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return None

# 
# REGULAR DJANGO VIEWS 
# 

class HomeView(TemplateView):
    '''Home page showing featured auctions'''
    template_name = "project/home.html"
    
    def get_context_data(self, **kwargs):
        '''return context with featured items'''
        context = super().get_context_data(**kwargs)
        now = timezone.now()
        context['featured_items'] = Item.objects.filter(end_time__gt=now).order_by('-listed_at')[:10]
        return context

class ItemAuctionListView(ListView):
    '''Define a view class to show a listing of items'''
    model = Item
    template_name = "project/item_list.html"
    context_object_name = "items"
    
    def get_queryset(self):
        '''return items ordered by listing date'''
        return Item.objects.all().order_by('-listed_at') 
   
class ItemAuctionDetailView(DetailView):
    '''Define a view class to show an Item's auction detail view'''
    model = Item
    template_name = "project/item_detail.html"
    context_object_name = "item"
    
    def get_context_data(self, **kwargs):
        '''add bids and comments to context'''
        context = super().get_context_data(**kwargs)
        item = self.get_object()
        context['bids'] = Bid.objects.filter(item=item).order_by('-timestamp')
        context['comments'] = Comment.objects.filter(item=item).order_by('-timestamp')
        return context
class ProfileDetailView(DetailView):
    '''Define a view class to show a Profile's detail view'''
    model = Profile
    template_name = "project/profile_detail.html"
    context_object_name = "profile"
    
    def get_context_data(self, **kwargs):
        '''add items and reviews to context'''
        context = super().get_context_data(**kwargs)
        profile = self.get_object()
        context['items'] = Item.objects.filter(owner=profile).order_by('-listed_at')
        context['reviews'] = Review.objects.filter(reviewed_profile=profile).order_by('-timestamp')
        return context

class ProfileListView(ListView):
    '''Define a view class to list all profiles'''
    model = Profile
    template_name = "project/profile_list.html"
    context_object_name = "profiles"
    
    def get_queryset(self):
        '''return profiles ordered by join date'''
        return Profile.objects.all().order_by('-join_date')

class CreateItemView(MyLoginRequiredMixin, CreateView):
    '''Define a view class to create a new auction item'''
    model = Item
    form_class = CreateItemForm
    template_name = "project/create_item_form.html"
    
    def get_success_url(self):
        '''redirect to item detail after creation'''
        return reverse('item_detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        '''set owner to logged in user's profile'''
        profile = self.get_logged_in_profile()
        if profile:
            form.instance.owner = profile
            return super().form_valid(form)
        else:
            return redirect('create_profile')

class UpdateItemView(MyLoginRequiredMixin, UpdateView):
    '''Define a view class to update an auction item'''
    model = Item
    form_class = UpdateItemForm
    template_name = "project/update_item_form.html"
    
    def get_success_url(self):
        '''redirect to item detail after update'''
        return reverse('item_detail', kwargs={'pk': self.object.pk})
    
    def get_queryset(self):
        '''only allow owner to update their items'''
        profile = self.get_logged_in_profile()
        if profile:
            return Item.objects.filter(owner=profile)
        return Item.objects.none()

class DeleteItemView(MyLoginRequiredMixin, DeleteView):
    '''Define a view class to delete an auction item'''
    model = Item
    template_name = "project/delete_item_form.html"
    
    def get_success_url(self):
        '''redirect to item list after deletion'''
        return reverse('item_list')
    
    def get_queryset(self):
        '''only allow owner to delete their items'''
        profile = self.get_logged_in_profile()
        if profile:
            return Item.objects.filter(owner=profile)
        return Item.objects.none()

class CreateBidView(MyLoginRequiredMixin, CreateView):
    '''Define a view class to place a bid on an item'''
    model = Bid
    form_class = CreateBidForm
    template_name = "project/create_bid_form.html"
    
    def get_success_url(self):
        '''redirect to item detail after placing bid'''
        return reverse('item_detail', kwargs={'pk': self.kwargs['item_id']})
    
    def get_context_data(self, **kwargs):
        '''add item to context'''
        context = super().get_context_data(**kwargs)
        item_id = self.kwargs['item_id']
        context['item'] = Item.objects.get(pk=item_id)
        return context
    
    def form_valid(self, form):
        '''set item and bidder'''
        item_id = self.kwargs['item_id']
        item = Item.objects.get(pk=item_id)
        profile = self.get_logged_in_profile()
        
        if profile:
            form.instance.item = item
            form.instance.bidder = profile
            return super().form_valid(form)
        else:
            return redirect('create_profile')

class CreateCommentView(MyLoginRequiredMixin, CreateView):
    '''Define a view class to create a comment on an item'''
    model = Comment
    form_class = CreateCommentForm
    template_name = "project/create_comment_form.html"
    
    def get_success_url(self):
        '''redirect to item detail after creating comment'''
        return reverse('item_detail', kwargs={'pk': self.kwargs['item_id']})
    
    def get_context_data(self, **kwargs):
        '''add item to context'''
        context = super().get_context_data(**kwargs)
        item_id = self.kwargs['item_id']
        context['item'] = Item.objects.get(pk=item_id)
        return context
    
    def form_valid(self, form):
        '''set item and profile'''
        item_id = self.kwargs['item_id']
        item = Item.objects.get(pk=item_id)
        profile = self.get_logged_in_profile()
        
        if profile:
            form.instance.item = item
            form.instance.profile = profile
            return super().form_valid(form)
        else:
            return redirect('create_profile')

class CreateReviewView(MyLoginRequiredMixin, CreateView):
    '''Define a view class to create a review on a profile'''
    model = Review
    form_class = CreateReviewForm
    template_name = "project/create_review_form.html"
    
    def get_success_url(self):
        '''redirect to profile detail after creating review'''
        return reverse('profile_detail', kwargs={'pk': self.kwargs['profile_id']})
    
    def get_context_data(self, **kwargs):
        '''add reviewed profile to context'''
        context = super().get_context_data(**kwargs)
        profile_id = self.kwargs['profile_id']
        context['reviewed_profile'] = Profile.objects.get(pk=profile_id)
        return context
    
    def form_valid(self, form):
        '''set reviewer and reviewed profile'''
        profile_id = self.kwargs['profile_id']
        reviewed_profile = Profile.objects.get(pk=profile_id)
        reviewer = self.get_logged_in_profile()
        
        if reviewer:
            form.instance.reviewer = reviewer
            form.instance.reviewed_profile = reviewed_profile
            return super().form_valid(form)
        else:
            return redirect('create_profile')

class CreateProfileView(CreateView):
    '''Define a view class to create a new profile/user'''
    model = Profile
    form_class = CreateProfileForm
    template_name = "project/create_profile_form.html"
    
    def get_success_url(self):
        '''redirect to profile list after creation'''
        return reverse('profile_list')
    
    def get_context_data(self, **kwargs):
        '''add user form to context'''
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserCreationForm()
        return context
    
    def form_valid(self, form):
        '''create user and attach to profile'''
        user_form = UserCreationForm(self.request.POST)
        
        if user_form.is_valid():
            user = user_form.save()
            form.instance.user = user
            login(self.request, user, backend='django.contrib.auth.backends.ModelBackend')
            return super().form_valid(form)
        else:
            context = self.get_context_data()
            context['user_form'] = user_form
            return self.render_to_response(context)

class UpdateProfileView(MyLoginRequiredMixin, UpdateView):
    '''Define a view class to update a profile'''
    model = Profile
    form_class = UpdateProfileForm
    template_name = "project/update_profile_form.html"
    
    def get_success_url(self):
        '''redirect to profile detail after update'''
        return reverse('my_profile')
    
    def get_object(self):
        '''return the logged in user's profile'''
        return self.get_logged_in_profile()

class LoggedInProfileDetailView(MyLoginRequiredMixin, DetailView):
    '''Define a view class to show logged in user's profile'''
    model = Profile
    template_name = "project/profile_detail.html"
    context_object_name = "profile"
    
    def get_object(self):
        '''return the logged in user's profile'''
        return self.get_logged_in_profile()
    
    def get_context_data(self, **kwargs):
        '''add items and reviews to context'''
        context = super().get_context_data(**kwargs)
        profile = self.get_object()
        context['items'] = Item.objects.filter(owner=profile).order_by('-listed_at')
        context['reviews'] = Review.objects.filter(reviewed_profile=profile).order_by('-timestamp')
        return context

# 
# REST API VIEWS 
# 

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from datetime import timedelta
from .serializers import *

class ProfileListCreateAPIView(generics.ListCreateAPIView):
    '''API View to list all profiles or create a new profile'''
    queryset = Profile.objects.all().order_by('-join_date')
    serializer_class = ProfileSerializer

class ProfileDetailAPIView(generics.RetrieveUpdateAPIView):
    '''API View to get, update a specific profile'''
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class ItemListCreateAPIView(generics.ListCreateAPIView):
    '''API View to list all items or create a new item'''
    queryset = Item.objects.all().order_by('-listed_at')
    serializer_class = ItemSerializer

class ItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    '''API View to get, update, or delete a specific item'''
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class BidListCreateAPIView(generics.ListCreateAPIView):
    '''API View to list all bids or create a new bid'''
    queryset = Bid.objects.all().order_by('-timestamp')
    serializer_class = BidSerializer

class BidDetailAPIView(generics.RetrieveAPIView):
    '''API View to get a specific bid'''
    queryset = Bid.objects.all()
    serializer_class = BidSerializer

class CommentListCreateAPIView(generics.ListCreateAPIView):
    '''API View to list all comments or create a new comment'''
    queryset = Comment.objects.all().order_by('-timestamp')
    serializer_class = CommentSerializer

class CommentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    '''API View to get, update, or delete a specific comment'''
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class ReviewListCreateAPIView(generics.ListCreateAPIView):
    '''API View to list all reviews or create a new review'''
    queryset = Review.objects.all().order_by('-timestamp')
    serializer_class = ReviewSerializer

class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    '''API View to get, update, or delete a specific review'''
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ItemBidsAPIView(APIView):
    '''API View to get all bids for a specific item'''
    def get(self, request, item_id):
        '''return all bids for a specific item'''
        try:
            item = Item.objects.get(pk=item_id)
            bids = Bid.objects.filter(item=item).order_by('-timestamp')
            serializer = BidSerializer(bids, many=True)
            return Response(serializer.data)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

class ItemCommentsAPIView(APIView):
    '''API View to get all comments for a specific item'''
    def get(self, request, item_id):
        '''return all comments for a specific item'''
        try:
            item = Item.objects.get(pk=item_id)
            comments = Comment.objects.filter(item=item).order_by('-timestamp')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

class ProfileItemsAPIView(APIView):
    '''API View to get all items for a specific profile'''
    def get(self, request, profile_id):
        '''return all items for a specific profile'''
        try:
            profile = Profile.objects.get(pk=profile_id)
            items = Item.objects.filter(owner=profile).order_by('-listed_at')
            serializer = ItemSerializer(items, many=True)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

class ProfileReviewsAPIView(APIView):
    '''API View to get all reviews for a specific profile'''
    def get(self, request, profile_id):
        '''return all reviews for a specific profile'''
        try:
            profile = Profile.objects.get(pk=profile_id)
            reviews = Review.objects.filter(reviewed_profile=profile).order_by('-timestamp')
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

class FeaturedItemsAPIView(APIView):
    '''API View to get featured/active items'''
    def get(self, request):
        '''return active items (not ended)'''
        now = timezone.now()
        items = Item.objects.filter(end_time__gt=now).order_by('-listed_at')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

class EndingSoonItemsAPIView(APIView):
    '''API View to get items ending soon'''
    def get(self, request):
        '''return items ending within the next 24 hours'''
        now = timezone.now()
        tomorrow = now + timedelta(hours=24)
        items = Item.objects.filter(end_time__gt=now, end_time__lte=tomorrow).order_by('end_time')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

class LoginAPIView(APIView):
    '''API View for user login, return token and user info'''
    permission_classes = [AllowAny]
    
    def post(self, request):
        '''login user and return token with user info'''
        username = request.data.get('username')
        password = request.data.get('password')
        
        # missing credentials
        if not username or not password:
            return Response(
                {'error': 'Username and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # return a User object if given credentials valid
        user = authenticate(username=username, password=password)
        
        if user:
            # issue token
            token, created = Token.objects.get_or_create(user=user)
            
            # serialize the user
            user_serializer = UserSerializer(user)
            
            # get user's profile if it exists
            try:
                profile = Profile.objects.get(user=user)
                profile_serializer = ProfileSerializer(profile)
                return Response({
                    'token': token.key,
                    'user': user_serializer.data,
                    'profile': profile_serializer.data,
                })
            except Profile.DoesNotExist:
                return Response({
                    'token': token.key,
                    'user': user_serializer.data,
                    'profile': None,
                })
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class RegisterAPIView(APIView):
    '''API View for user registration'''
    permission_classes = [AllowAny]
    
    def post(self, request):
        '''register new user and create profile'''
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        profile_username = request.data.get('profile_username', username)
        bio_text = request.data.get('bio_text', '')
        
        # missing credentials
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # create profile
        profile = Profile.objects.create(
            user=user,
            username=profile_username,
            first_name=first_name,
            last_name=last_name,
            bio_text=bio_text
        )
        
        # generate token
        token = Token.objects.create(user=user)
        
        user_serializer = UserSerializer(user)
        profile_serializer = ProfileSerializer(profile)
        
        return Response({
            'token': token.key,
            'user': user_serializer.data,
            'profile': profile_serializer.data,
        }, status=status.HTTP_201_CREATED)

class CurrentUserAPIView(APIView):
    '''API View to get current authenticated user info'''
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        '''return current user and profile info'''
        user_serializer = UserSerializer(request.user)
        
        try:
            profile = Profile.objects.get(user=request.user)
            profile_serializer = ProfileSerializer(profile)
            return Response({
                'user': user_serializer.data,
                'profile': profile_serializer.data,
            })
        except Profile.DoesNotExist:
            return Response({
                'user': user_serializer.data,
                'profile': None,
            })
   
