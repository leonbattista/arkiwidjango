import surf

store = surf.Store(reader = 'sparql_protocol',
                   endpoint = 'http://dbpedia.org/sparql',
                   default_graph = 'http://dbpedia.org')

print 'Create the session'
session = surf.Session(store, {})
session.enable_logging = True

Building = session.get_class("http://dbpedia.org/ontology/Building")

piazza = session.get_resource("http://dbpedia.org/resource/Piazza_San_Marco", Building)

print piazza

FoafPerson = session.get_class(surf.ns.FOAF.Person)
for person in FoafPerson.get_by(foaf_name = "John"):
    print "Found person:", person.foaf_name.first




# print 'Phil Collins has %d albums on dbpedia' % len(all_albums)
#
# first_album = all_albums.first()
# first_album.load()
#
# print 'All covers'
# for a in all_albums:
#     if a.dbpedia_name:
#         cvr = a.dbpedia_cover
#         print '\tCover %s for "%s"' % (str(a.dbpedia_cover), str(a.dbpedia_name))