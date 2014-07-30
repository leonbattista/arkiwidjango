from django.views.generic import View
from django.shortcuts import render
from django.http import HttpResponse
import json

def index(request):
    
    
    return render(request, 'app/base.html')
    
def test(request):
    
    params = request.GET
    testList = range(int(params['b']))
    if params['a'] == "corbu":
        data = {"reponse":"Le Corbusier", "testB":testList}
    else:
        data = {"reponse":"cool aussi en fait", "testB":testList}
        
    return HttpResponse(json.dumps(data), "application/json")


