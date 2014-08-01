from django import forms
from app.models import UserProfile
from django.contrib.auth.models import User

class ImageUploadForm(forms.Form):

    """Image upload form."""

    name = forms.CharField()
    architect = forms.CharField()
    image = forms.ImageField()
    
class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('picture',)