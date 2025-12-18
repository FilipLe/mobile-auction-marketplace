# File: project/models.py
# Model construction for mobile auction marketplace app
# Author: Nguyen Le
# Description: App that incorporates React Native Frontend and Django REST Backend 
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Avg
from django.utils import timezone

# Create your models here.
class Profile(models.Model):
    '''Encapsulate the data of a Profile on the auction marketplace'''
    
    # attributes of a Profile
    username = models.TextField(blank=True)
    last_name = models.TextField(blank=True)
    first_name = models.TextField(blank=True)
    profile_image = models.ImageField(blank=True)
    bio_text = models.TextField(blank=True)
    join_date = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="auction_profile") # request.user.auction_profile instead of request.user.profile
    
    def __str__(self):
        '''return a string representation of this model instance'''
        return f'User {self.first_name} {self.last_name}, under the username "{self.username}"'
    
    def get_average_rating(self):
        '''helper method ORM to compute the average rating seller has'''
        return Review.objects.filter(reviewed_profile=self).aggregate(Avg('numerical_rating'))

    
class Item(models.Model):
    '''Encapsulate the data of an Item being auctioned'''
    
    # attributes of an Item
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE) # foreign key
    title = models.TextField(blank=True)
    description = models.TextField(blank=True)
    item_image = models.ImageField(blank=True)
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    listed_at = models.DateTimeField(auto_now=True)
    end_time = models.DateTimeField()
    
    def __str__(self):
        '''return a string representation of this model instance'''
        return f'Item "{self.title}" posted by {self.owner.username} for auction'
    
    def get_num_bids(self):
        '''helper method ORM to retrieve amount of bids'''
        return Bid.objects.filter(item=self).count()
    
    def get_current_bid(self):
        '''helper method ORM to retrieve current highest bid'''
        highest = Bid.objects.filter(item=self).order_by('-bid_amount').first()
        if highest:
            return highest.bid_amount
        return self.starting_bid
    
    def get_time_left(self):
        '''helper method to calculate remaining time of auction (time it is supposed to end - current time)'''
        time_left = self.end_time - timezone.now()
        if time_left.total_seconds() < 0:
            return "Ended"
        return time_left


class Bid(models.Model):
    '''Encapsulate the data of a placed Bid'''
    
    # attributes of a Bid
    item = models.ForeignKey(Item, on_delete=models.CASCADE) # foreign key
    bidder = models.ForeignKey(Profile, on_delete=models.CASCADE) # foreign key
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        '''return a string representation of this model instance'''
        return f'Bid of amount {self.bid_amount} placed by {self.bidder.username} for item {self.item.title}'

class Comment(models.Model):
    '''Encapsulate the data of a Comment on an item auction'''
    
    # atttributes of a Comment
    item = models.ForeignKey(Item, on_delete=models.CASCADE) # foreign key
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE) # foreign key
    text = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        '''return a string representtion of this model instance'''
        return f'{self.timestamp}: Comment by user "{self.profile.username}" under item "{self.item.title}"'
    
    
class Review(models.Model):
    '''Encapsulate the data of a Rating Review left by users on a Seller's page'''
    
    class Rating(models.IntegerChoices):
        '''storing ratings 1-5 for the numerical_rating field'''
        rate_1_stars = 1
        rate_2_stars = 2
        rate_3_stars = 3
        rate_4_stars = 4
        rate_5_stars = 5
        
    
    reviewer = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='written_reviews') # foreign key
    reviewed_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_reviews') # foreign key
    feedback = models.TextField(blank=True)
    numerical_rating = models.IntegerField(choices=Rating.choices) # restricting ratings from 1 to 5  
    timestamp = models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        '''return a string representation of this model instance'''
        return f"{self.timestamp}: Review by {self.reviewer.username} on {self.reviewed_profile.username}'s profile. Rating: {self.numerical_rating}"
    