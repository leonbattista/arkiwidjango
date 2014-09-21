import urllib
import rdflib
from rdflib.resource import Resource
import time
import logging
from rdflib import *
from SPARQLWrapper import SPARQLWrapper, JSON, RDF
import datetime, re
from django.utils import timezone
from ..app.models import Project
from django.contrib.auth.models import User

logging.basicConfig()

# get clean URIs       
def fix(s):
    i = s.rindex('/')
    return s[:i]+urllib.quote(s[i:])

sparql = SPARQLWrapper("http://dbpedia.org/sparql")

sparql.setQuery("""

prefix dbpedia: <http://dbpedia.org/ontology/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

CONSTRUCT { ?structure a dbpedia:Building .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure dbpedia-owl:thumbnail ?thumbnail .
?structure dbpedia-owl:architect ?architect .
?architect rdfs:label ?stripped_architect_name .
?structure rdfs:label ?stripped_structure_name }

WHERE {
?structure a dbpedia:Building .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure rdfs:label ?structure_name .
optional {
    ?structure dbpedia-owl:thumbnail ?thumbnail .
    ?structure dbpedia-owl:architect ?architect .
    ?architect rdfs:label ?architect_name .
    bind (str(?architect_name) as ?stripped_architect_name)
}
bind (str(?structure_name) as ?stripped_structure_name)
}

LIMIT 1

""")


sparql.setReturnFormat(RDF)
results = sparql.query().convert()
print results.serialize()

# resource = Resource(results, "http://dbpedia.og/resource/Pantheon,_Rome")
# print "    " + str(resource.value(URIRef("http://dbpedia.org/ontology/thumbnail")))

structureList = []

for stmt in results.subjects(URIRef("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), URIRef("http://dbpedia.org/ontology/Building")):

    resource = Resource(results, stmt)
    print resource.value(RDFS.label)
    print "    " + str(resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#long")))
    print "    " + str(resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#lat")))
    # Retrieve thumb and remove "?width=300" to get main image URL
    thumb_url = resource.value(URIRef("http://dbpedia.org/ontology/thumbnail")).identifier
    i = thumb_url.rindex('?')
    print thumb_url[:i]
    for architect in resource[URIRef("http://dbpedia.org/ontology/architect")]:
        print "    " + str(architect.value(RDFS.label).encode('ascii', 'ignore'))
    
    
    
    
