# Frontend - React Native Expo App

This directory contains the React Native mobile application built with Expo and Expo Router.

## Architecture

The frontend is built using:
- **Expo Router**: File-based routing system
- **React Context**: For global state management (authentication)
- **AsyncStorage**: For persistent token storage
- **TypeScript**: For type safety

## Layout System

### Root Layout (`app/_layout.tsx`)

The root layout sets up:
- Theme provider (dark/light mode)
- **AuthProvider**: Wraps entire app to provide authentication state
- Stack navigation with screens:
  - `(tabs)`: Main tab navigation
  - `edit-profile`: Edit profile screen
  - `item-detail`: Item detail screen
  - `profile-detail`: Profile detail screen
  - `login`: Login screen
  - `modal`: Modal presentation

### Tab Layout (`app/(tabs)/_layout.tsx`)

Defines the bottom tab navigation with four tabs:
1. **Home** (`index.tsx`): Featured/active auctions
2. **Auctions** (`items.tsx`): All auction listings
3. **Create** (`create.tsx`): Create new auction item
4. **Profile** (`profile.tsx`): View own profile

## Screens

### Tab Screens

- **Home** (`index.tsx`): Displays featured active auctions
- **Auctions** (`items.tsx`): Lists all available auction items
- **Create** (`create.tsx`): Form to create new auction listing
- **Profile** (`profile.tsx`): Displays current user's profile

### Stack Screens

- **Login** (`login.tsx`): User authentication screen
- **Register** (`register.tsx`): New user registration screen
- **Item Detail** (`item-detail.tsx`): Detailed view of auction item with bids and comments
- **Profile Detail** (`profile-detail.tsx`): View any user's profile with their items and reviews
- **Edit Profile** (`edit-profile.tsx`): Edit current user's profile information
- **Create Review** (`create-review.tsx`): Form to leave a review on a seller's profile

## Authentication Integration with DRF

### AuthContext (`contexts/AuthContext.tsx`)

The `AuthContext` provides global authentication state and methods throughout the app.

**State:**
- `user`: Current user object
- `profile`: Current user's profile
- `token`: Authentication token
- `loading`: Loading state

**Methods:**
- `login(username, password)`: Authenticate with backend
- `register(username, email, password, profileData)`: Register new user
- `logout()`: Clear authentication state
- `refreshProfile()`: Refresh profile from backend

### Authentication Flow

#### Login Process

1. User enters credentials in `login.tsx`
2. Calls `login()` from `AuthContext`
3. `AuthContext` sends POST to `/api/auth/login/` with username and password
4. Backend validates credentials and returns:
   ```json
   {
     "token": "auth_token_string",
     "user": { ... },
     "profile": { ... }
   }
   ```
5. `AuthContext` stores token, user, and profile in:
   - React state (for app access)
   - AsyncStorage (for persistence across app restarts)
6. App navigates to authenticated screens

#### Registration Process

1. User fills registration form in `register.tsx`
2. Calls `register()` from `AuthContext` with:
   - Username, email, password
   - Profile data (first_name, last_name, bio_text, profile_image)
3. `AuthContext` sends POST to `/api/auth/register/`
4. Backend creates User and Profile, returns token
5. If profile image provided, uploads image via PATCH to `/api/profile/<id>/`
6. Token and user data stored in state and AsyncStorage
7. App navigates to authenticated screens

#### Authenticated API Requests

All authenticated API calls include the token in the Authorization header:

```typescript
headers: {
  'Authorization': `Token ${token}`
}
```

The token is retrieved from `AuthContext` or AsyncStorage.

#### Token Persistence

- Token stored in AsyncStorage with key `auth_token`
- On app restart, `AuthContext` loads token from AsyncStorage
- If token exists, fetches user profile to restore session
- If token invalid, user must login again

### API Service (`services/api.ts`)

Provides:
- `API_BASE_URL`: Base URL for all API endpoints
- `handleApiError()`: Error handling utility

All API calls use this base URL to construct full endpoint paths.

## Navigation Flow

### Unauthenticated Flow
- App starts → Check for stored token
- If no token → Navigate to `login.tsx`
- User can register via `register.tsx`

### Authenticated Flow
- Token found → Load user/profile from storage
- Navigate to `(tabs)` → Main app screens
- User can access all features

### Screen Navigation
- Tab screens accessible via bottom navigation
- Stack screens (item-detail, profile-detail, etc.) navigated via `router.push()`
- Modal screens use modal presentation

## Key Features

- **Token-based authentication**: Secure API access
- **Persistent sessions**: Tokens stored locally
- **Profile management**: View and edit user profiles
- **Auction browsing**: Browse and search auction items
- **Bidding**: Place bids on active auctions
- **Comments**: Comment on auction items
- **Reviews**: Leave reviews on seller profiles
- **Image upload**: Upload profile and item images

## Running the App

1. Install dependencies:
```bash
npm install
```

2. Start Expo development server:
```bash
npm expo start
```

## Configuration

Update `services/api.ts` to set the correct `API_BASE_URL` for your backend server.
