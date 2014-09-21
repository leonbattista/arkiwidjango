import rdflib
import urllib
import time
import logging
from rdflib import Graph, URIRef
from SPARQLWrapper import SPARQLWrapper, JSON

logging.basicConfig()

# get clean URIs       
def fix(s):
    i = s.rindex('/')
    return s[:i]+urllib.quote(s[i:])

# Prefixes 
dbpedia = "<http://dbpedia.org/ontology/>"
geo = "<http://www.w3.org/2003/01/geo/wgs84_pos#>"

sparql = SPARQLWrapper("http://live.dbpedia.org/sparql")
sparql.setQuery("""
prefix dbpedia: <http://dbpedia.org/ontology/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
select * where { 
?structure a dbpedia:ArchitecturalStructure .
} 
limit 1
""")

sparql.setReturnFormat(JSON)
results = sparql.query().convert()

# "replace" below: dbpedia was down at time of writing this script
structureURIs = [result["structure"]["value"] for result in results["results"]["bindings"]]

for structureURI in structureURIs:
    print structureURI
    g = Graph()
    g.parse(structureURI)
    print len(g)
    for stmt in g.subject_objects(URIRef("http://dbpedia.org/ontology/architect")):
         print "    " + fix(stmt[1])
    



    