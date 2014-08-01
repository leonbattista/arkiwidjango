import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'arkiwi',
        'USER': 'postgres',
        'PASSWORD': 'ArKiwi!2014',
        'HOST': '127.0.0.1',                      
        'PORT': '5432',                      
    }
}

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'bi509xybs7a&x(686r5@30u#krl%_y*$p_@^yd7sn*k7+7(cmj'

# debug = true for developement, debug = false for deployment
DEBUG = False
TEMPLATE_DEBUG = True

ALLOWED_HOSTS = ['localhost']

STATIC_ROOT = '/www/arkiwi/'
MEDIA_ROOT = '/www/arkiwi/arkiwi/media/'

INSTALLED_APPS += (
'gunicorn',
)