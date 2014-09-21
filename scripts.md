To run a script from the 'scripts' directory

Provide path to the settings file

    export DJANGO_SETTINGS_MODULE='arkiwidjango.arkiwi.settings'

where 'arkiwidjango' is the name of the main directory (containing app, arkiwi and scripts)

then from the parent of this main directory do for example

     python -m arkiwidjango.scripts.importDBPedia_2_def

(this runs the script as a package, which permits to use relative import in the script)

OR if this doesn't work, simply

    export DJANGO_SETTINGS_MODULE='arkiwi.settings'

copy script to main directory (eg. 'arkiwidjango')
run script from there with

    python script.py

