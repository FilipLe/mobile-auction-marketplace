# Backend - Django REST Framework API

The backend application uses Django REST Framework to provide a RESTful API endpoints. It includes both traditional Django views (for web interface) and REST API views (for mobile app consumption).

## Models

### Profile
Extends Django's User model with additional profile information.

**Fields:**
- `username` (TextField)
- `first_name` (TextField)
- `last_name` (TextField)
- `profile_image` (ImageField)
- `bio_text` (TextField)
- `join_date` (DateTimeField, auto-generated)
- `user` (ForeignKey to User)

**Methods:**
- `get_average_rating()`: Calculates average rating from reviews

### Item
Represents an auction item listing.

**Fields:**
- `owner` (ForeignKey to Profile)
- `title` (TextField)
- `description` (TextField)
- `item_image` (ImageField)
- `starting_bid` (DecimalField)
- `listed_at` (DateTimeField, auto-generated)
- `end_time` (DateTimeField)

**Methods:**
- `get_num_bids()`: Returns count of bids on this item
- `get_current_bid()`: Returns highest bid amount or starting bid
- `get_time_left()`: Calculates remaining auction time

### Bid
Represents a bid placed on an auction item.

**Fields:**
- `item` (ForeignKey to Item)
- `bidder` (ForeignKey to Profile)
- `bid_amount` (DecimalField)
- `timestamp` (DateTimeField, auto-generated)

### Comment
Represents a comment on an auction item.

**Fields:**
- `item` (ForeignKey to Item)
- `profile` (ForeignKey to Profile)
- `text` (TextField)
- `timestamp` (DateTimeField, auto-generated)

### Review
Represents a review/rating left on a seller's profile.

**Fields:**
- `reviewer` (ForeignKey to Profile)
- `reviewed_profile` (ForeignKey to Profile)
- `feedback` (TextField)
- `numerical_rating` (IntegerField, choices: 1-5)
- `timestamp` (DateTimeField, auto-generated)

## Views

### Web Views (Django Template Views)

Traditional Django class-based views for web interface:

- `HomeView`: Displays featured active auctions
- `ItemAuctionListView`: Lists all auction items
- `ItemAuctionDetailView`: Shows item details with bids and comments
- `ProfileDetailView`: Shows profile with items and reviews
- `ProfileListView`: Lists all profiles
- `CreateItemView`: Create new auction item (login required)
- `UpdateItemView`: Update item (owner only)
- `DeleteItemView`: Delete item (owner only)
- `CreateBidView`: Place a bid (login required)
- `CreateCommentView`: Add comment (login required)
- `CreateReviewView`: Leave review (login required)
- `CreateProfileView`: Create new user profile
- `UpdateProfileView`: Update profile (login required)
- `LoggedInProfileDetailView`: View own profile (login required)

### REST API Views

Django REST Framework views for mobile app:

**List/Create Views:**
- `ProfileListCreateAPIView`: List all profiles or create new
- `ItemListCreateAPIView`: List all items or create new
- `BidListCreateAPIView`: List all bids or create new
- `CommentListCreateAPIView`: List all comments or create new
- `ReviewListCreateAPIView`: List all reviews or create new

**Detail Views:**
- `ProfileDetailAPIView`: Get/update specific profile
- `ItemDetailAPIView`: Get/update/delete specific item
- `BidDetailAPIView`: Get specific bid
- `CommentDetailAPIView`: Get/update/delete specific comment
- `ReviewDetailAPIView`: Get/update/delete specific review

**Custom API Views:**
- `ItemBidsAPIView`: Get all bids for a specific item
- `ItemCommentsAPIView`: Get all comments for a specific item
- `ProfileItemsAPIView`: Get all items for a specific profile
- `ProfileReviewsAPIView`: Get all reviews for a specific profile
- `FeaturedItemsAPIView`: Get active (non-ended) items
- `EndingSoonItemsAPIView`: Get items ending within 24 hours

**Authentication Views:**
- `LoginAPIView`: Authenticate user and return token
- `RegisterAPIView`: Create new user and profile, return token
- `CurrentUserAPIView`: Get current authenticated user info

## URLs

### Web URLs

- `/` - Home page
- `/items/` - Item listings
- `/item/<id>/` - Item detail
- `/profiles/` - Profile listings
- `/profile/<id>/` - Profile detail
- `/profile/` - Current user's profile
- `/item/create/` - Create item
- `/item/<id>/update/` - Update item
- `/item/<id>/delete/` - Delete item
- `/item/<id>/bid/` - Place bid
- `/item/<id>/comment/` - Add comment
- `/profile/<id>/review/` - Leave review
- `/profile/create/` - Create profile
- `/profile/update/` - Update profile
- `/login/` - Login page
- `/logout/` - Logout

### REST API URLs

**Profiles:**
- `GET/POST /api/profiles/` - List or create profiles
- `GET/PATCH /api/profile/<id>/` - Get or update profile
- `GET /api/profile/<id>/items/` - Get profile's items
- `GET /api/profile/<id>/reviews/` - Get profile's reviews

**Items:**
- `GET/POST /api/items/` - List or create items
- `GET/PATCH/DELETE /api/item/<id>/` - Get, update, or delete item
- `GET /api/item/<id>/bids/` - Get item's bids
- `GET /api/item/<id>/comments/` - Get item's comments
- `GET /api/items/featured/` - Get active items
- `GET /api/items/ending-soon/` - Get items ending soon

**Bids:**
- `GET/POST /api/bids/` - List or create bids
- `GET /api/bid/<id>/` - Get specific bid

**Comments:**
- `GET/POST /api/comments/` - List or create comments
- `GET/PATCH/DELETE /api/comment/<id>/` - Get, update, or delete comment

**Reviews:**
- `GET/POST /api/reviews/` - List or create reviews
- `GET/PATCH/DELETE /api/review/<id>/` - Get, update, or delete review

**Authentication:**
- `POST /api/auth/login/` - Login (returns token)
- `POST /api/auth/register/` - Register (returns token)
- `GET /api/auth/user/` - Get current user (requires authentication)

## Authentication Flow

### Token-Based Authentication

The backend uses Django REST Framework's Token Authentication for API access.

### Registration Flow

1. Client sends POST request to `/api/auth/register/` with:
   - `username`
   - `email`
   - `password`
   - `first_name` (optional)
   - `last_name` (optional)
   - `profile_username` (optional, defaults to username)
   - `bio_text` (optional)

2. Backend:
   - Creates Django User object
   - Creates Profile object linked to User
   - Generates authentication token
   - Returns token, user data, and profile data

3. Client stores token for subsequent authenticated requests

### Login Flow

1. Client sends POST request to `/api/auth/login/` with:
   - `username`
   - `password`

2. Backend:
   - Authenticates credentials using Django's `authenticate()`
   - Retrieves or creates token for user
   - Returns token, user data, and profile data (if exists)

3. Client stores token for subsequent authenticated requests

### Authenticated Requests

For protected endpoints, client includes token in request header:
```
Authorization: Token <token_key>
```

The backend uses `IsAuthenticated` permission class to verify the token.

### Current User Endpoint

`GET /api/auth/user/` returns the current authenticated user's information. Requires valid token in Authorization header.

## Serializers

All models have corresponding DRF serializers in `serializers.py`:
- `UserSerializer`: Django User model
- `ProfileSerializer`: Profile model with nested User
- `ItemSerializer`: Item model with computed fields (num_bids, current_bid, time_left)
- `BidSerializer`: Bid model with nested Item and Profile
- `CommentSerializer`: Comment model with nested Item and Profile
- `ReviewSerializer`: Review model with nested Profile relationships

## Permissions

- Most API endpoints require authentication (`IsAuthenticated`)
- Registration and login endpoints allow anonymous access (`AllowAny`)
- Web views use `MyLoginRequiredMixin` for login protection
- Item update/delete views restrict access to item owners only
