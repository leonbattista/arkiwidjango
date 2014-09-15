import rdflib
import urllib
import logging
from rdflib import Graph, URIRef
from SPARQLWrapper import SPARQLWrapper, JSON

logging.basicConfig()

# get clean URIs       
def fix(s):
    i = s.rindex('/')
    return s[:i]+urllib.quote(s[i:])

sparql = SPARQLWrapper("http://live.dbpedia.org/sparql")
sparql.setQuery("""
prefix dbpedia: <http://dbpedia.org/ontology/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
select * where { 
?structure a dbpedia:ArchitecturalStructure .
?structure rdfs:label ?structure_name .
} 
limit 10
""")

sparql.setReturnFormat(JSON)
results = sparql.query().convert()



# "replace" below: dbpedia was down at time of writing this script
structureURIs = [result["structure"]["value"].replace("dbpedia.org", "live.dbpedia.org") for result in results["results"]["bindings"]]

for structureURI in structureURIs:
    print structureURI
    g = Graph()
    g.parse(structureURI)
    for stmt in g.subject_objects(URIRef("http://dbpedia.org/ontology/architect")):
         print "    " + fix(stmt[1])



# g.parse("http://live.dbpedia.org/resource/Washington_Navy_Yard")


    