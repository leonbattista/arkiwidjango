import urllib
import rdflib
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

CONSTRUCT { ?structure a dbpedia:ArchitecturalStructure .
?structure geo:long ?long .
?structure geo:lat ?lat .
?structure dbpedia-owl:architect ?architect .
?architect rdfs:label ?stripped_architect_name .
?structure rdfs:label ?stripped_structure_name }
WHERE {
?structure a dbpedia:ArchitecturalStructure .
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

LIMIT 1

""")

sparql.setReturnFormat(RDF)
results = sparql.query().convert()

print results.serialize()

resource = rdflib.resource.Resource(results, URIRef("http://dbpedia.org/resource/Christ_Church_Cathedral,_Newcastle"))

print type(RDFS.label)
print resource.value(URIRef("http://dbpedia.org/ontology/architect"))


# # "replace" below: dbpedia was down at time of writing this script
# structureURIs = [result["structure"]["value"].replace("dbpedia.org", "dbpedia.org") for result in results["results"]["bindings"]]
#
# output = []
#
# for structureURI in structureURIs:
#     print structureURI
#     g = Graph()
#     g.parse(structureURI)
#     for stmt in g.subject_objects(URIRef("http://dbpedia.org/ontology/architect")):
#          print "    " + fix(stmt[1])