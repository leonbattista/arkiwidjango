* Production server IP
185.26.127.243

* Website root
Located at /www/arkiwi
there should be cloned the contents of the git repository 'arkiwidjango'

* Virtual environment
Located at /opt/arkiwienv

* Nginx log file
var/log/nginx/error.log

* Nginx configuration files

/etc/nginx/nginx.conf
Added line:

	client_max_body_size 20M; 

to allow bigger uploads, value to be increased further if necessary

/etc/nginx/sites-available/arkiwialpha
/etc/nginx/sites-enabled/arkiwialpha


* Run gunicorn 

Log as user 'deploy'

	su - deploy


If it is not loaded, load environment:

	source /opt/arkiwienv/bin/activate

Then in folder /www/arkiwi do:

	screen -S gunicorn
	gunicorn arkiwi.wsgi:application --workers=3 --user=deploy --bind 127.0.0.1:8001 --log-file gunicorn.log --log-level debug
(Nginx is configured to listen on port 8001)

If screen does not work:
 
	script /dev/null

Then detach screen: Ctrl+A, then d
(see http://aperiodic.net/screen/quick_reference)

TO DO: use supervisor instead

* Backup of server version of settings_local.py

located in folder /www/local
to be copied to /www/arkiwi/arkiwi/local after each git cloning

* Database migration
The south migrations should have been created during development, thus simply do:
	./manage.py migrate
on the production server