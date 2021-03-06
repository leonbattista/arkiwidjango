from rest_framework import serializers
from app.models import Project
from django.contrib.auth.models import User
import re


class ProjectSerializer(serializers.ModelSerializer):
    # owner = serializers.RelatedField(view_name='user-detail')
    # pub_date = serializers.DateTimeField()
    
    # def transform_pub_date(self, obj, value):
    #     try:
    #         readable_date = obj.pub_date.strftime("%d %b. %Y")
    #     except AttributeError:
    #         readable_date = ""
    #     return readable_date
        
    # def transform_owner(self, obj, value):
    #
    #     return "api" + re.search("/api(.*)", value).group(1)
        
        

    class Meta:
        model = Project
        fields = ('id', 'name', 'architect', 'owner','pub_date', 'address', 'latitude', 'longitude', 'image_file','thumbnail_file', 'description', 'wikipedia_image_url', 'wikipedia_page_id')

class MapProjectSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Project
        fields = ('id', 'name', 'latitude', 'longitude')
    

# To allow browsing other users, following, etc.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    projects = serializers.HyperlinkedRelatedField(view_name='project-detail', many=True)

    class Meta:
        model = User
        fields = ('url', 'username', 'projects')

# From richardtier.com, for authentication, etc.  
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'is_staff', 'id')
        write_only_fields = ('password',)
 
    def restore_object(self, attrs, instance=None):
        # call set_password on user object. Without this
        # the password will be stored in plain text.
        user = super(AccountSerializer, self).restore_object(attrs, instance)
        user.set_password(attrs['password'])
        return user
