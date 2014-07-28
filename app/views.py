from django.views.generic import View
from djangular.views.mixins import JSONResponseMixin, allow_remote_invocation
from django.shortcuts import render
from djangular.core.urlresolvers import get_all_remote_methods    

def index(request):
    
    
    return render(request, 'app/base.html')


