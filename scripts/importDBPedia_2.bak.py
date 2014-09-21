import urllib
import rdflib
from rdflib.resource import Resource
import time
import logging
from rdflib import *
from SPARQLWrapper import SPARQLWrapper, JSON, RDF

logging.basicConfig()

# get clean URIs       
def fix(s):
    i = s.rindex('/')
    return s[:i]+urllib.quote(s[i:])

sparql = SPARQLWrapper("http://live.dbpedia.org/sparql")

sparql.setQuery("""

prefix dbpedia: <http://dbpedia.org/ontology/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

CONSTRUCT { ?structure a dbpedia:Building .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure dbpedia-owl:architect ?architect .
?architect rdfs:label ?stripped_architect_name .
?structure rdfs:label ?stripped_structure_name }
WHERE {
?structure a dbpedia:Building .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure rdfs:label ?structure_name .
optional {
    ?structure dbpedia-owl:architect ?architect .
    ?architect rdfs:label ?architect_name .
    bind (str(?architect_name) as ?stripped_architect_name)
}
bind (str(?structure_name) as ?stripped_structure_name)
}

LIMIT 10000

""")


sparql.setReturnFormat(RDF)
results = sparql.query().convert()
#print results.serialize()

structureList = []

for stmt in results.subjects(URIRef("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), URIRef("http://dbpedia.org/ontology/Building")):

    resource = Resource(results, stmt)
    print resource.value(RDFS.label)
    print "    " + str(resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#long")))
    print "    " + str(resource.value(URIRef("http://www.w3.org/2003/01/geo/wgs84_pos#lat")))
    for architect in resource[URIRef("http://dbpedia.org/ontology/architect")]:
        print "    " + str(architect.value(RDFS.label).encode('ascii', 'ignore'))
    
    
    
    
