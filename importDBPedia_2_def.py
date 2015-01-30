import urllib
import rdflib
from rdflib.resource import Resource
import time
import logging
from rdflib import *
from SPARQLWrapper import SPARQLWrapper, JSON, RDF
import datetime, re
from django.utils import timezone
from app.models import Project
from django.contrib.auth.models import User
from django.utils import timezone

logging.basicConfig()

# Fixing URI that rdflib does not accept, returning "WARNING:rdflib.term:  does not look like a valid URI, trying to serialize this will break."  
def url_fix(s):
    i = s.rindex('/')
    return s[:i]+urllib.quote(s[i:],'/#')

def sanitize_triple(t):
    
    def sanitize_triple_item(item):
        if isinstance(item, URIRef):
            return URIRef(url_fix(str(item)))
        return item

    return (sanitize_triple_item(t[0]),
            sanitize_triple_item(t[1]),
            sanitize_triple_item(t[2]))

sparql = SPARQLWrapper("http://dbpedia.org/sparql")

sparql.setQuery("""

prefix dbpedia: <http://dbpedia.org/ontology/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

CONSTRUCT { ?structure a dbpedia:Building .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure dbpedia-owl:thumbnail ?thumbnail .
?structure dbpedia-owl:architect ?architect .
?structure dbpedia-owl:wikiPageID ?wiki_page_id .
?structure dbpprop:architect ?architect_prop .
?architect rdfs:label ?stripped_architect_name .
?structure rdfs:label ?stripped_structure_name .
}

WHERE {
    SELECT DISTINCT ?structure 
                    ?long
                    ?lat
                    ?thumbnail
                    ?architect
                    ?wiki_page_id
                    ?architect_prop
                    ?stripped_architect_name
                    ?stripped_architect_name
    WHERE {
        
        ?structure a dbpedia:Building .
        ?structure geo:long ?long .
        ?structure geo:lat ?lat .
        ?structure dbpedia-owl:wikiPageID ?wiki_page_id .
        ?structure rdfs:label ?structure_name .
        optional {
            ?structure dbpedia-owl:thumbnail ?thumbnail .
        }
        optional {
            ?structure dbpprop:architect ?architect_prop .
        }
        optional {
            ?structure dbpedia-owl:wikiPageID ?wiki_page_id .
        }
        optional {   
            ?structure dbpedia-owl:architect ?architect .
            ?architect rdfs:label ?architect_name .
            bind (str(?architect_name) as ?stripped_architect_name)
        }
        bind (str(?structure_name) as ?stripped_structure_name)
        }

        ORDER BY  ASC(?structure)
    
    }

OFFSET  40000
LIMIT  100

""")


sparql.setReturnFormat(RDF)
print sparql.query()
results = sparql.query().convert()
#print results.serialize()

# fixedgraph = rdflib.Graph()
# fixedgraph += [ sanitize_triple([s,p,o]) for s,p,o in results ]


nProjects = 0

for stmt in results.subjects(URIRef("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), URIRef("http://dbpedia.org/ontology/Building")):
    
    if nProjects%500 == 0:
        print nProjects

    resource = Resource(results, stmt)


    p = Project()
    p.owner = User.objects.get(username = "DBPediaImporter")
        
    p.name = resource.value(RDFS.label)
    p.longitude = resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#long"))
    p.latitude = resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#lat"))
    p.wikipedia_page_id = resource.value(URIRef("http://dbpedia.org/ontology/wikiPageID"))

    # Retrieve and concatenate all architects names

    architects = [architect.value(RDFS.label) for architect in resource[URIRef("http://dbpedia.org/ontology/architect")]]
    #.encode('ascii', 'ignore'))
    if architects != []:
        p.architect = ",".join(architects)
    else:
        architect = resource.value(URIRef("http://dbpedia.org/property/architect"))
        if architect:
            if type(architect) == Resource:
                p.architect = architect.identifier.encode('ascii', 'ignore')
            else:
                p.architect = architect.encode('ascii', 'ignore')
        else:
            p.architect = ''
    # Retrieve thumb and remove "?width=300" to get main image URL
    if resource.value(URIRef("http://dbpedia.org/ontology/thumbnail")):
        thumb_url = resource.value(URIRef("http://dbpedia.org/ontology/thumbnail")).identifier
        i = thumb_url.rindex('?')
        p.wikipedia_image_url = thumb_url[:i]

    ten_months = datetime.timedelta(days=300)
    p.pub_date = timezone.make_aware(datetime.datetime.now() - ten_months, timezone.get_current_timezone())
    p.is_imported = True
    p.save()

    nProjects += 1

print "Imported " + str(nProjects) + " projects."
    
    
    
    
