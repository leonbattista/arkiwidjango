To run a script from the 'scripts' directory

Provide path to the settings file

    export DJANGO_SETTINGS_MODULE='arkiwidjango.arkiwi.settings'

where 'arkiwidjango' is the name of the main directory (containing app, arkiwi and scripts)

then from this main drectory do for example

     python -m arkiwidjango.scripts.importDBPedia_2_def

(this runs the script as a package, which permits to use relative import in the script)