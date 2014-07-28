from django.db import models
from django.contrib.auth.models import User

class Tag(models.Model):
    tag = models.CharField(max_length=50)
    def __unicode__(self):
        return self.tag
        
class Image(models.Model):
    
    title = models.CharField(max_length=60, blank=True, null=True)
    image_file = models.ImageField(upload_to="images")
    thumbnail = models.ImageField(upload_to="images")
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    
    # Publication information
    
    pub_date = models.DateTimeField('date published')
    user = models.ForeignKey(User, null=True, blank=True)
    
    tags = models.ManyToManyField(Tag, blank=True)
    
    rating = models.IntegerField(default=50)

    def __unicode__(self):
        return self.image_file.name

class Project(models.Model):
    
    # Project information
    
    name = models.CharField(max_length=200)
    architect = models.CharField(max_length=200)
    built_date = models.DateTimeField('date built', null=True)
    image_file = models.ImageField(upload_to="images/", null=True, blank=True)
    thumbnail_file = models.ImageField(upload_to="images/", null=True, blank=True)
    
    
    # Entry publication information
    
    pub_date = models.DateTimeField('date published', null=True )
    user = models.ForeignKey(User, null=True, blank=True)
    
    tags = models.ManyToManyField(Tag, blank=True)
    images = models.ManyToManyField(Image, blank=True)
    
    rating = models.IntegerField(default=50)
    

        

