
import datetime, re
from django.utils import timezone
from app.models import Project
from django.contrib.auth.models import User
from django.utils import timezone


projects = Project.objects.filter(owner=12)

for project in projects:
    project.rating += 50
    project.save()
    
    
    
    
