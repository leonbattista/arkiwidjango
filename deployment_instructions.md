* Website root
Located at /www/arkiwi
there should be cloned the contents of the git repository 'arkiwidjango'

* Virtual environment
Located at /opt/arkiwienv

* Run gunicorn 

Log as user 'deploy': su - deploy

Load environment: source /opt/arkiwienv/bin/activate

gunicorn arkiwi.wsgi:application --workers=3 --user=deploy --bind 127.0.0.1:8001 --log-file gunicorn.log --log-level debug

(Nginx is configured to listen on port 8001)

To be done in a separate screen session
TO DO: use supervisor instead

* Backup of server version of settings_local.py

located in folder /www/local
to be copied to /www/arkiwi/arkiwi/local after each git cloning

* Database migration
The south migrations should have been created during development, thus simply do:
./manage.py migrate
on the production server