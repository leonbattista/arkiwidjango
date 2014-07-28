from django.views.generic import View
from djangular.views.mixins import JSONResponseMixin, allow_remote_invocation
from django.shortcuts import render


def index(request):
    return render(request, 'app/base.html')

class MyJSONView(JSONResponseMixin, View):
    # other view methods

    @allow_remote_invocation
    def process_something(self, in_data):
        # process in_data
        out_data = {
            'foo': 'bar',
            'success': True,
    	}
    	return out_data
