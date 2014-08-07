# **** IMPORTS ****

# External Python modules
import json, os
from cStringIO import StringIO
from tempfile import NamedTemporaryFile
from PIL import Image as PImage
from os.path import join as pjoin
from math import ceil

# Django
from django.core.files.base import ContentFile
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.conf import settings
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect

# REST Framework
from rest_framework import permissions, renderers, viewsets, generics
from rest_framework.decorators import link
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

# Application
from app.models import Project
from app.permissions import IsOwnerOrReadOnly, IsStaffOrTargetUser
from app.serializers import ProjectSerializer, UserSerializer, AccountSerializer
from app.forms import ImageUploadForm, UserForm, UserProfileForm
from app.utils import get_rotation_code, rotate_image, jsonToObj
from authentication import QuietBasicAuthentication

# **** BASIC VIEWS ****

def index(request):
     
    return render(request, 'app/base.html')
    

# Client-server communication test 
def test(request):
    
    params = request.GET
    testList = range(int(params['b']))
    if params['a'] == "corbu":
        data = {"reponse":"Le Corbusier", "testB":testList}
    else:
        data = {"reponse":"cool aussi en fait", "testB":testList}
        
    return HttpResponse(json.dumps(data), "application/json")
    
# First version of search

class SearchView(generics.ListAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        params = self.request.GET
        
        print params
        
        return Project.objects.filter(name__icontains=params['project_name'], architect__icontains=params['architect'])




# **** FORM HANDLING VIEWS ****
def current_user(request):
    return HttpResponse(request.user.username)
    
def add(request):
    
    address = jsonToObj(request.body)
    print "{0:.10f}".format(address.geometry.location.k)
    return HttpResponse(request.user.username)
    

@csrf_exempt
def detail(request):
    
    if request.method == 'POST':

        form = ImageUploadForm(request.POST, request.FILES)

        if form.is_valid():
            
            p = Project()
            p.owner = request.user
            p.name = form.cleaned_data['name']
            p. architect = form.cleaned_data['architect']
            p.image_file = form.cleaned_data['image']
            p.save()
            
            image_file = request.FILES['image']
            
            image_str = ''
            for c in image_file.chunks():
                image_str += c
            image_file_strio = StringIO(image_str)
            image = PImage.open(image_file_strio)
            if image.mode != "RGB":
                image = image.convert('RGB')

            rotation_code = get_rotation_code(image)
            image = rotate_image(image, rotation_code)    
            
            width, height = image.size
            
            print "Original image: %s x %s" %(width, height)

            wh_ratio = float(width) / float(height)
            
            print "wh_ratio: %s " %wh_ratio
            
            if wh_ratio > 4.0/3.0 and height > 300:
                print "Horizontal image"
                ratio = 300.0 / float(height)
                print "ratio: %s" %ratio 
                image.thumbnail((int(ceil(width * ratio)), 300), PImage.ANTIALIAS)
                width, height = image.size
                print "Thumbnail image: %s x %s" %(width, height) 
                cropped_image = image.crop((int(width / 2) - 200, 0, int(width / 2) + 200, 300))
                print "Cropped: %s x %s" %cropped_image.size
            else:
                if width > 400:
                    ratio = 400.0 / float(width)
                    image.thumbnail((400, int(ceil(height * ratio))), PImage.ANTIALIAS)
                    width, height = image.size
                    cropped_image = image.crop((0, int(height / 2) - 150, 400, int(height / 2) + 150))
                else:
                    cropped_image = image
                                
            
            
            filename, ext = os.path.splitext(p.image_file.name)
            thumb_filename = settings.MEDIA_ROOT + filename + "-thumb" + ext
            #cropped_image.save(thumb_filename, "JPEG")
            
            f = StringIO()
            try:
                cropped_image.save(f, format='jpeg')
                s = f.getvalue()
                print type(p.thumbnail_file)
                p.thumbnail_file.save(thumb_filename, ContentFile(s))
                p.save()
            finally:
                f.close()    

            return HttpResponseRedirect('/')
        
    else:
            
        form = ImageUploadForm()
        
    return render(request, 'app/detail.html', {'form': form })

# **** REST API :VIEWSETS ****

# From Django REST tutorial
class ProjectViewSet(viewsets.ModelViewSet):
    """
    This endpoint presents projects.

    The **owner** of the project may update or delete instances
    of the project.
    
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsOwnerOrReadOnly,)

    """@link(renderer_classes=(renderers.StaticHTMLRenderer,))
    def highlight(self, request, *args, **kwargs):
        snippet = self.get_object()
        return Response(snippet.highlighted)"""

    def pre_save(self, obj):
        obj.owner = self.request.user

# From Django REST tutorial
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This endpoint presents the users in the system.

    As you can see, the collection of project instances owned by a user are
    serialized using a hyperlinked representation.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
# **** Accounts API ****

# From richardtier.com
class AccountView(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    model = User
 
    def get_permissions(self):
        # allow non-authenticated user to create via POST
        return ([AllowAny() if self.request.method == 'POST' else IsStaffOrTargetUser()])
        
class AuthView(APIView):
    authentication_classes = (QuietBasicAuthentication, AllowAny)
    serializer_class = AccountSerializer
 
    def post(self, request, *args, **kwargs):
        login(request, request.user)
        return Response(AccountSerializer(request.user).data)
 
    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response({})


    
# **** USER MANAGEMENT PURELY ON DJANGO SIDE ****

def register(request):
    # Like before, get the request's context.
    context = RequestContext(request)

    # A boolean value for telling the template whether the registration was successful.
    # Set to False initially. Code changes value to True when registration succeeds.
    registered = False

    # If it's a HTTP POST, we're interested in processing form data.
    if request.method == 'POST':
        # Attempt to grab information from the raw form information.
        # Note that we make use of both UserForm and UserProfileForm.
        user_form = UserForm(data=request.POST)
        profile_form = UserProfileForm(data=request.POST)

        # If the two forms are valid...
        if user_form.is_valid() and profile_form.is_valid():
            # Save the user's form data to the database.
            user = user_form.save()

            # Now we hash the password with the set_password method.
            # Once hashed, we can update the user object.
            user.set_password(user.password)
            user.save()

            # Now sort out the UserProfile instance.
            # Since we need to set the user attribute ourselves, we set commit=False.
            # This delays saving the model until we're ready to avoid integrity problems.
            profile = profile_form.save(commit=False)
            profile.user = user

            # Did the user provide a profile picture?
            # If so, we need to get it from the input form and put it in the UserProfile model.
            if 'picture' in request.FILES:
                profile.picture = request.FILES['picture']

            # Now we save the UserProfile model instance.
            profile.save()

            # Update our variable to tell the template registration was successful.
            registered = True

        # Invalid form or forms - mistakes or something else?
        # Print problems to the terminal.
        # They'll also be shown to the user.
        else:
            print user_form.errors, profile_form.errors

    # Not a HTTP POST, so we render our form using two ModelForm instances.
    # These forms will be blank, ready for user input.
    else:
        user_form = UserForm()
        profile_form = UserProfileForm()

    # Render the template depending on the context.
    return render_to_response(
            'app/register.html',
            {'user_form': user_form, 'profile_form': profile_form, 'registered': registered},
            context)
            
def user_login(request):
    # Like before, obtain the context for the user's request.
    context = RequestContext(request)

    # If the request is a HTTP POST, try to pull out the relevant information.
    if request.method == 'POST':
        # Gather the username and password provided by the user.
        # This information is obtained from the login form.
        username = request.POST['username']
        password = request.POST['password']

        # Use Django's machinery to attempt to see if the username/password
        # combination is valid - a User object is returned if it is.
        user = authenticate(username=username, password=password)

        # If we have a User object, the details are correct.
        # If None (Python's way of representing the absence of a value), no user
        # with matching credentials was found.
        if user:
            # Is the account active? It could have been disabled.
            if user.is_active:
                # If the account is valid and active, we can log the user in.
                # We'll send the user back to the homepage.
                login(request, user)
                return HttpResponseRedirect('/')
            else:
                # An inactive account was used - no logging in!
                return HttpResponse("Your Arkiwi account is disabled.")
        else:
            # Bad login details were provided. So we can't log the user in.
            print "Invalid login details: {0}, {1}".format(username, password)
            return HttpResponse("Invalid login details supplied.")

    # The request is not a HTTP POST, so display the login form.
    # This scenario would most likely be a HTTP GET.
    else:
        # No context variables to pass to the template system, hence the
        # blank dictionary object...
        return render_to_response('app/login.html', {}, context)
        
@login_required
def user_logout(request):
    # Since we know the user is logged in, we can now just log them out.
    logout(request)

    # Take the user back to the homepage.
    return HttpResponseRedirect('/')
    



