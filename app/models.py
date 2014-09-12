from django.db import models
from django.contrib.auth.models import User

class Tag(models.Model):
    tag = models.CharField(max_length=50)
    def __unicode__(self):
        return self.tag
        
class Image(models.Model):
    
    owner = models.ForeignKey(User, null=True, blank=True)
    
    title = models.CharField(max_length=60, blank=True, null=True)
    image_file = models.ImageField(upload_to="images")
    thumbnail = models.ImageField(upload_to="images")
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    
    # Publication information
    
    pub_date = models.DateTimeField('date published')
    
    tags = models.ManyToManyField(Tag, blank=True)
    
    rating = models.IntegerField(default=50)

    def __unicode__(self):
        return self.image_file.name

class Project(models.Model):
    
    # Entry publication information
    
    owner = models.ForeignKey(User, null=True, blank=True, related_name='projects')
    
    pub_date = models.DateTimeField('date published', null=True )
    
    tags = models.ManyToManyField(Tag, blank=True)
    images = models.ManyToManyField(Image, blank=True)
    
    rating = models.IntegerField(default=50)
    
    # Project information
    
    name = models.CharField(max_length=200)
    architect = models.CharField(max_length=200)
    address = models.CharField(max_length=500, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    built_date = models.DateTimeField('date built', null=True)
    image_file = models.ImageField(upload_to="images/", null=True, blank=True)
    thumbnail_file = models.ImageField(upload_to="images/", null=True, blank=True)
    is_imported = models.BooleanField(default=False)
    source = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=3000, blank=True)
    
class UserProfile(models.Model):
    
    user = models.OneToOneField(User)
    picture = models.ImageField(upload_to='profile_images', blank=True)
    
    def __unicode__(self):
        return self.user.username
    
    

    

        

