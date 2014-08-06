from app import views
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

router = DefaultRouter(trailing_slash=False)
routerWithSlash = DefaultRouter()

router.register(r'projects', views.ProjectViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'accounts', views.AccountView, 'list')

# routerWithSlash.register(r'projects', views.ProjectViewSet)
# routerWithSlash.register(r'users', views.UserViewSet)
# routerWithSlash.register(r'accounts', views.AccountView, 'list')

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^test/?$', views.test, name='test'),
    url(r'^detail/?', views.detail, name='detail'),
    url(r'^register/?$', views.register, name='register'),
    url(r'^login/?$', views.user_login, name='login'),
    url(r'^logout/?$', views.user_logout, name='logout'),
    url(r'^api/current_user/?$', views.current_user, name='current_user'),
    url(r'^api/', include(router.urls)),
    url(r'^api/auth/?$', views.AuthView.as_view(), name='authenticate'), #from richardtier.com
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')) #from DRF
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)