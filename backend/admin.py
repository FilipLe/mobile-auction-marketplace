# File: project/admin.py
# Model registration for mobile auction marketplace app
# Author: Nguyen Le
# Description: App that incorporates React Native Frontend and Django REST Backend 

from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Profile)
admin.site.register(Item)
admin.site.register(Bid)
admin.site.register(Comment)
admin.site.register(Review)