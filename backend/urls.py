# File: project/urls.py
# URL patterns for mobile auction marketplace app
# Author: Nguyen Le
# Description: App that incorporates React Native Frontend and Django REST Backend 
from django.urls import path, reverse_lazy
from .views import *
from django.contrib.auth import views as auth_views


urlpatterns = [
    # 
    # REGULAR WEB VIEWS
    # 
    
    # Home and listings
    path('', HomeView.as_view(), name='home'),
    path('items/', ItemAuctionListView.as_view(), name='item_list'),
    path('item/<int:pk>/', ItemAuctionDetailView.as_view(), name='item_detail'),
    
    # Profiles
    path('profiles/', ProfileListView.as_view(), name='profile_list'),
    path('profile/<int:pk>/', ProfileDetailView.as_view(), name='profile_detail'),
    path('profile/', LoggedInProfileDetailView.as_view(), name='my_profile'),
    
    # Item CRUD
    path('item/create/', CreateItemView.as_view(), name='create_item'),
    path('item/<int:pk>/update/', UpdateItemView.as_view(), name='update_item'),
    path('item/<int:pk>/delete/', DeleteItemView.as_view(), name='delete_item'),
    
    # Bids
    path('item/<int:item_id>/bid/', CreateBidView.as_view(), name='create_bid'),
    
    # Comments
    path('item/<int:item_id>/comment/', CreateCommentView.as_view(), name='create_comment'),
    
    # Reviews
    path('profile/<int:profile_id>/review/', CreateReviewView.as_view(), name='create_review'),
    
    # Profile management
    path('profile/create/', CreateProfileView.as_view(), name='create_profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    
    # Authentication
    path('login/', auth_views.LoginView.as_view(template_name="project/login.html"), name="login"),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name="logout"),
    
    # 
    # REST API ENDPOINTS
    # 
    
    # Profiles API
    path('api/profiles/', ProfileListCreateAPIView.as_view(), name='api_profile_list'),
    path('api/profile/<int:pk>/', ProfileDetailAPIView.as_view(), name='api_profile_detail'),
    path('api/profile/<int:profile_id>/items/', ProfileItemsAPIView.as_view(), name='api_profile_items'),
    path('api/profile/<int:profile_id>/reviews/', ProfileReviewsAPIView.as_view(), name='api_profile_reviews'),
    
    # Items API
    path('api/items/', ItemListCreateAPIView.as_view(), name='api_item_list'),
    path('api/item/<int:pk>/', ItemDetailAPIView.as_view(), name='api_item_detail'),
    path('api/item/<int:item_id>/bids/', ItemBidsAPIView.as_view(), name='api_item_bids'),
    path('api/item/<int:item_id>/comments/', ItemCommentsAPIView.as_view(), name='api_item_comments'),
    path('api/items/featured/', FeaturedItemsAPIView.as_view(), name='api_featured_items'),
    path('api/items/ending-soon/', EndingSoonItemsAPIView.as_view(), name='api_ending_soon'),
    
    # Bids API
    path('api/bids/', BidListCreateAPIView.as_view(), name='api_bid_list'),
    path('api/bid/<int:pk>/', BidDetailAPIView.as_view(), name='api_bid_detail'),
    
    # Comments API
    path('api/comments/', CommentListCreateAPIView.as_view(), name='api_comment_list'),
    path('api/comment/<int:pk>/', CommentDetailAPIView.as_view(), name='api_comment_detail'),
    
    # Reviews API
    path('api/reviews/', ReviewListCreateAPIView.as_view(), name='api_review_list'),
    path('api/review/<int:pk>/', ReviewDetailAPIView.as_view(), name='api_review_detail'),

    # Auth API
    path('api/auth/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api_register'),
    path('api/auth/user/', CurrentUserAPIView.as_view(), name='api_current_user'),
]
