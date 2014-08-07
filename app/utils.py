import json
from PIL import Image, ExifTags

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
    
