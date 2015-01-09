import urllib2
import json
from SPARQLWrapper import SPARQLWrapper, JSON, RDF

sparql = SPARQLWrapper("http://dbpedia.org/sparql")

def isIDanArchictecturalStructure(id):

    sparql.setQuery("""
    SELECT ?type WHERE
    {
        ?structure dbpedia-owl:wikiPageID %s .
        ?structure a ?type
    }

    """ % id)

    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    
    found = False
    
    #Looking for the type 'ArchitecturalStructure' in the results
    for result in results['results']['bindings']:
        if result['type']['value'] == u"http://dbpedia.org/ontology/ArchitecturalStructure":
            found = True
            break
    return found

def wikiMinerSuggest(id):
    query = '?queryTopics=%s&responseFormat=JSON' % id
    response = urllib2.urlopen('http://wikipedia-miner.cms.waikato.ac.nz/services/suggest' + query)
    data = json.load(response)
    for category in data['suggestionCategories']:
        print category['title']
        print '-------------'
        for suggestion in category['suggestions']:
            if isIDanArchictecturalStructure(suggestion['id']):
                print suggestion['title'], suggestion['id']
    for suggestion in data['uncategorizedSuggestions']:
        if isIDanArchictecturalStructure(suggestion['id']):
            print suggestion['title'], suggestion['id']
        
                
wikiMinerSuggest(23672)
    
    






