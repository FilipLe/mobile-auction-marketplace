# File: project/forms.py
# define the forms for CRUD operations
# Author: Nguyen Le
# App that incorporates React Native Frontend and Django REST Backend 

from django import forms
from .models import *

##
## Item
##

class CreateItemForm(forms.ModelForm):
    '''A form to add an Item to the database'''
    
    class Meta:
        '''associate this form with Item model from our database'''
        model = Item
        fields = ['title','description','item_image','starting_bid','end_time']
        
class UpdateItemForm(forms.ModelForm):
    '''A form to update an Item to the database'''
    
    class Meta:
        '''associate this form with Item model from our database'''
        model = Item
        fields = ['title','description','item_image','starting_bid','end_time']

##
## Bid
##

class CreateBidForm(forms.ModelForm):
    '''A form to add a Bid to the database'''
    
    class Meta:
        '''associate this form with a Bid model from our database'''
        model = Bid
        fields = ['bid_amount']

##
## Commment
## 

class CreateCommentForm(forms.ModelForm):
    '''A form to add a Comment to the database'''
    
    class Meta:
        '''associate this form with Comment model from our database'''
        model = Comment
        fields = ['text']
        
class UpdateCommentForm(forms.ModelForm):
    '''A form to add a Comment to the database'''
    
    class Meta:
        '''associate this form with Comment model from our database'''
        model = Comment
        fields = ['text']

##
## Review
##

class CreateReviewForm(forms.ModelForm):
    '''A form to add a Review to the database'''
    
    class Meta:
        '''associate this form with Review model from our database'''
        model = Review
        fields = ['numerical_rating','feedback']
        
class UpdateReviewForm(forms.ModelForm):
    '''A form to update a Review to the database'''
    
    class Meta:
        '''associate this form with Review model from our database'''
        model = Review
        fields = ['numerical_rating','feedback']


##
## Profile
##

class CreateProfileForm(forms.ModelForm):
    '''A form to add a Profile to the database'''
    
    class Meta:
        '''associate this form with Profile model from our database'''
        model = Profile
        fields = ['username', 'first_name','last_name','profile_image','bio_text']
        
        
class UpdateProfileForm(forms.ModelForm):
    '''A form to update a Profile to the database'''
    
    class Meta:
        '''associate this form with Profile model from our database'''
        model = Profile
        fields = ['profile_image','bio_text']