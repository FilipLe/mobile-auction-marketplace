# Mobile Auction Marketplace

A full-stack mobile auction marketplace application built with React Native (Expo) frontend and Django REST Framework backend.

## Overview

This application allows users to:
- Browse and search auction items
- Create and manage auction listings
- Place bids on items
- Comment on auction items
- Review seller profiles
- Manage user profiles

## Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Django with Django REST Framework
- **Authentication**: Django REST Framework Token Authentication

## Directory Structure

```
mobile-auction-marketplace/
├── backend/          # Django REST API backend
│   ├── models.py     # Database models
│   ├── views.py      # API and web views
│   ├── urls.py       # URL routing
│   ├── serializers.py # DRF serializers
│   └── templates/    # Django HTML templates
├── frontend/         # React Native Expo app
│   ├── app/          # Expo Router screens
│   ├── components/   # Reusable React components
│   ├── contexts/     # React contexts (AuthContext)
│   ├── services/     # API service layer
│   └── assets/       # Images, fonts, styles
└── README.md         # This file
```

## Models

The application uses the following Django models:

### Profile
- User profile information linked to Django's User model
- Fields: `username`, `first_name`, `last_name`, `profile_image`, `bio_text`, `join_date`
- Related to: User (ForeignKey)

### Item
- Auction items/listings
- Fields: `owner`, `title`, `description`, `item_image`, `starting_bid`, `listed_at`, `end_time`
- Related to: Profile (ForeignKey - owner)

### Bid
- Bids placed on auction items
- Fields: `item`, `bidder`, `bid_amount`, `timestamp`
- Related to: Item (ForeignKey), Profile (ForeignKey - bidder)

### Comment
- Comments on auction items
- Fields: `item`, `profile`, `text`, `timestamp`
- Related to: Item (ForeignKey), Profile (ForeignKey)

### Review
- Reviews/ratings left on seller profiles
- Fields: `reviewer`, `reviewed_profile`, `feedback`, `numerical_rating` (1-5), `timestamp`
- Related to: Profile (ForeignKey - reviewer and reviewed_profile)

## How to Run

### Prerequisites
- Python 3.x
- Node.js and npm
- Django and Django REST Framework
- Expo CLI

### Backend Setup

1. Navigate to the backend directory (or your Django project root):
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install django djangorestframework django-cors-headers pillow
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Run the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm expo start
```