from pykml import parser
import datetime, re
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
    p.description = re.search("description: (.*)", placemark.description.text).group(1)
    hundred_years = datetime.timedelta(days=36500)
    p.pub_date = datetime.datetime.now() - hundred_years
    p.is_imported = True
    p.save()
        
    nProjects += 1

print "Imported " + str(nProjects) + " projects."

    
