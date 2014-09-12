from pykml import parser
import datetime
from django.utils import timezone
from app.models import Project
from django.contrib.auth.models import User

with open('scripts/all.kml') as f:
    doc = parser.parse(f)
    
root = doc.getroot()

nProjects = 0

for placemark in root.Document.Folder.Placemark:
    
    p = Project()
    p.owner = User.objects.get(username = "KMLImporter")
    p.name = placemark.name.text
    coordinates = placemark.Point.coordinates.text.split(',')
    p.longitude = coordinates[0]
    p.latitude = coordinates[1]
    p.description = placemark.description.text
    p.pub_date = datetime.date(1970,1,1)
    p.is_imported = True
    p.save()
        
    nProjects += 1

print "Imported " + str(nProjects) + " projects."

    
