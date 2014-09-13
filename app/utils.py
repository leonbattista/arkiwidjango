import os, json
from PIL import Image, ExifTags
from cStringIO import StringIO
from PIL import Image as PImage
from math import ceil
from django.conf import settings
from django.core.files.base import ContentFile


def makeThumb(project, image_file):
    
    print 'making thumb'
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

    filename, ext = os.path.splitext(project.image_file.name)
    thumb_filename = settings.MEDIA_ROOT + filename + "-thumb" + ext

    f = StringIO()
    try:
        cropped_image.save(f, format='jpeg')
        s = f.getvalue()
        # print type(project.thumbnail_file)
        project.thumbnail_file.save(thumb_filename, ContentFile(s))
        project.save()
    finally:
        f.close()    

# **** CORRECT IMAGE ROTATION STORED IN EXIF DATA ****
def get_rotation_code(img):
    """
    Returns rotation code which say how much photo is rotated.
    Returns None if photo does not have exif tag information. 
    Raises Exception if cannot get Orientation number from python 
    image library.
    """
    if not hasattr(img, '_getexif') or img._getexif() is None:
        return None

    for code, name in ExifTags.TAGS.iteritems():
        if name == 'Orientation':
            orientation_code = code
            break
    else:
        raise Exception('Cannot get orientation code from library.')

    return img._getexif().get(orientation_code, None)


class IncorrectRotationCode(Exception):
    pass


def rotate_image(img, rotation_code):
    """
    Returns rotated image file.

    img: PIL.Image file.
    rotation_code: is rotation code retrieved from get_rotation_code.
    
    
    """
    if rotation_code == 1:
        return img
    if rotation_code == 3:
        img = img.transpose(Image.ROTATE_180)
    elif rotation_code == 6:
        img = img.transpose(Image.ROTATE_270)
    elif rotation_code == 8:
        img = img.transpose(Image.ROTATE_90)
    else:
        print "YO"
    return img
    

# Deserialization
def jsonToObj(s):
    def h2o(x):
        if isinstance(x, dict):
            return type('jo', (), {k: h2o(v) for k, v in x.iteritems()})
        else:
            return x
    return h2o(json.loads(s))
    

# "Pagination" helper function to feed scroll-down-to-load-more
def paginateQueryset(request, queryset):
    
    params = request.GET
    
    if 'after' in params and 'nitems' in params:
        after = int(params['after'])
        nitems = int(params['nitems'])
        end = after + nitems
        queryset = queryset[after:end]
      
    return queryset
    
