import urllib2
import json

response = urllib2.urlopen('http://stats.grok.se/json/en/latest90/Leikanger%20church')
data = json.load(response)
print sum(data[u'daily_views'].values())