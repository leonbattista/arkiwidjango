# **** IMPORTS ****

# External Python modules
import json, os, copy, urllib, urllib2
from django.utils import timezone
from cStringIO import StringIO
from tempfile import NamedTemporaryFile
from PIL import Image as PImage
from SPARQLWrapper import SPARQLWrapper, JSON, RDF
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
from app.permissions import IsOwnerOrReadOnly, IsStaffOrTargetUser, IsStaffOrOwnerOrReadOnly
from app.serializers import ProjectSerializer, MapProjectSerializer, UserSerializer, AccountSerializer
from app.forms import ImageUploadForm, UserForm, UserProfileForm
from app.utils import get_rotation_code, rotate_image, jsonToObj, paginateQueryset, makeThumb
from authentication import QuietBasicAuthentication

# **** BASIC VIEWS ****

def index(request):
     
    return render(request, 'app/base.html')
    

# Client-server communication test 
def test(request):
    
    params = request.GET
        
    return HttpResponse(json.dumps(data), "application/json")
    
def wikiImages(request):
    
    params = request.GET
    currentId = params['id']
        
    api_key = "AIzaSyCooVyggUatNZJ9d_HJjvu66jiET0ZJ23g"
    service_url = 'https://www.googleapis.com/freebase/v1/topic'
    topic_id = '/m/0d6lp'
    params = {
      'key': api_key,
      'filter': 'suggest'
    }
    url = service_url + topic_id + '?' + urllib.urlencode(params)
    topic = json.loads(urllib.urlopen(url).read())
    
    print topic
    
    return HttpResponse(topic, content_type="application/json")
    
    
    
def explore(request):
    
    sparql = SPARQLWrapper("http://dbpedia.org/sparql")
    
    def isIDanArchictecturalStructure(id):

        sparql.setQuery("""
        SELECT ?type WHERE
        {
            ?structure dbpedia-owl:wikiPageID %s .
            ?structure a ?type
        }

        """ % id)

        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
    
        found = False
    
        #Looking for the type 'ArchitecturalStructure' in the results
        for result in results['results']['bindings']:
            if result['type']['value'] == u"http://dbpedia.org/ontology/ArchitecturalStructure":
                found = True
                break
        return found

    def wikiMinerSuggest(id):
        output = {'categories': [], 'uncategorizedSuggestions': []}
        query = '?queryTopics=%s&responseFormat=JSON' % id
        response = urllib2.urlopen('http://wikipedia-miner.cms.waikato.ac.nz/services/suggest' + query)
        
        return response
        
        # data = json.load(response)
        # for category in data['suggestionCategories']:
        #     currentSuggestions = []
        #     for suggestion in category['suggestions']:
        #         if isIDanArchictecturalStructure(suggestion['id']):
        #             currentSuggestions.append(suggestion)
        #     if currentSuggestions != []:
        #         output['categories'].append({'title': category['title'], 'suggestions': currentSuggestions})
        # for suggestion in data['uncategorizedSuggestions']:
        #     if isIDanArchictecturalStructure(suggestion['id']):
        #             output['uncategorizedSuggestions'].append(suggestion)
        # return output
    
    
    params = request.GET
    currentId = params['id']
    response_data = wikiMinerSuggest(currentId)
    
 
    #return HttpResponse(json.dumps(response_data), content_type="application/json")
    return HttpResponse(wikiMinerSuggest(currentId), content_type="application/json")
    
# First version of search

class SearchView(generics.ListAPIView):
    
    serializer_class = ProjectSerializer

    def get_queryset(self):
        
        print self.serializer_class

        user = self.request.user
        params = self.request.GET
                
        return paginateQueryset(self.request, Project.objects.filter(name__icontains=params['project_name'], architect__icontains=params['architect'], address__icontains=params['address'], description__icontains=params['description'], owner__username__icontains=params['owner']).order_by('-rating', 'wikipedia_page_id')[:500])

class MapTargetView(generics.ListAPIView):
    
    serializer_class = ProjectSerializer
    
    
    def get_queryset(self):
        
        params = self.request.GET
        
        return Project.objects.filter(latitude__gt=params['min_lat'], latitude__lt=params['max_lat'], longitude__gt=params['min_lon'], longitude__lt=params['max_lon']).order_by('-rating', 'wikipedia_page_id')[:1000]

class MapProjectsView(generics.ListAPIView):
    
    serializer_class = MapProjectSerializer
    
    def get_queryset(self):
        
        return Project.objects.all().order_by('-rating', 'wikipedia_page_id')[:2000]


# **** FORM HANDLING VIEWS ****
class CurrentUserView(APIView):
    
    def get(self, request, format=None):
        
        try:
            user = User.objects.get(pk=self.request.user.id)
            serializer = AccountSerializer(user)
            return Response(serializer.data)
                    
        except:
            return Response("null")       
        
    
def add(request):
    
    form = ImageUploadForm(request.POST, request.FILES)
    
    if form.is_valid():
        
        p = Project()
        p.owner = request.user
        p.name = form.cleaned_data['name']
        p.architect = form.cleaned_data['architect']        
        
        try:
            p.address = form.cleaned_data['address']
            p.latitude = form.cleaned_data['latitude']
            p.longitude = form.cleaned_data['longitude']
        except KeyError:
            pass
        
        p.pub_date = timezone.now()
        p.image_file = form.cleaned_data['image']
        
        print form.cleaned_data
        
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
        
        wh_ratio = float(width) / float(height)
                
        if width <= 400 and height <= 300:
            cropped_image = image
        else:
            if wh_ratio > 4.0/3.0:
                if height > 300:
                    ratio = 300.0 / float(height)
                    image.thumbnail((int(ceil(width * ratio)), 300), PImage.ANTIALIAS)
                    width, height = image.size
            else:
                if width > 400:
                    ratio = 400.0 / float(width)
                    image.thumbnail((400, int(ceil(height * ratio))), PImage.ANTIALIAS)
                    width, height = image.size
                    
            left = max(int(width/2)-200, 0)
            bottom = max(int(height/2)-150, 0)
            right = min(int(width/2)+200, width)
            top = min(int(height/2)+150, height)
            
            
            cropped_image = image.crop([max(int(width/2)-200, 0), max(int(height/2)-150, 0), min(int(width/2)+200, width), min(int(height/2)+150, height)])
                
                            
        
        
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

        return HttpResponse(p.id)
    
    
    return HttpResponse('')

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
                          IsStaffOrOwnerOrReadOnly,)
    
    def list(self, request):
        
        
        queryset = Project.objects.all().order_by('wikipedia_page_id','-rating')
                                     
        queryset = paginateQueryset(request, queryset)
       
        serializer = ProjectSerializer(queryset, many=True)
        
        return Response(serializer.data)
        
    def partial_update(self, request, pk=None):
                                
        response = super(ProjectViewSet, self).partial_update(request, pk=None)
        
        files = request.FILES
        
        if files.has_key('image_file'):
            print "image file detected"
            p = Project.objects.get(pk=request.DATA['id'])
            image_file = files['image_file']
            makeThumb(p, image_file)
            
        return response
        
            

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
    



