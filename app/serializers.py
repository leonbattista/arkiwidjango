from rest_framework import serializers
from app.models import Project
from django.contrib.auth.models import User


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.Field(source='owner.username')

    class Meta:
        model = Project
        fields = ('id', 'name', 'architect', 'owner','pub_date','image_file','thumbnail_file')

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
        fields = ('username', 'password', 'first_name', 'last_name', 'email')
        write_only_fields = ('password',)
 
    def restore_object(self, attrs, instance=None):
        # call set_password on user object. Without this
        # the password will be stored in plain text.
        user = super(AccountSerializer, self).restore_object(attrs, instance)
        user.set_password(attrs['password'])
        return user
