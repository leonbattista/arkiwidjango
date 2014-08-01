from rest_framework import serializers
from app.models import Project
from django.contrib.auth.models import User


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.Field(source='owner.username')

    class Meta:
        model = Project
        fields = ('name', 'architect', 'pub_date','image_file','thumbnail_file')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    projects = serializers.HyperlinkedRelatedField(view_name='project-detail', many=True)

    class Meta:
        model = User
        fields = ('url', 'username', 'projects')
