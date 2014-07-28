from django.conf.urls import patterns, include, url
from app import views
from django.views.generic import View
from django.http import HttpResponse
from djangular.views.mixins import JSONResponseMixin, allow_remote_invocation

class RemoteMethodsView(JSONResponseMixin, View):
    # other view methods

    @allow_remote_invocation
    def process_something(self, in_data):
        # process in_data
        out_data = {
            'foo': 'bar',
            'success': True,
    	}
    	return out_data

subsub_patterns = patterns('',
    url(r'^app/$', RemoteMethodsView.as_view(), name='app'),
)

sub_patterns = patterns('',
    url(r'^sub/', include(subsub_patterns, namespace='sub')),
)

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^sub_methods/', include(sub_patterns, namespace='submethods')),
    url(r'^straight_methods/$', RemoteMethodsView.as_view(), name='straightmethods'),
)