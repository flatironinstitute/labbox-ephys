# import hither functions by importing all subdirectories that have a __init__.py
import importlib
import os
import sys

# prepend this directory to the path so we can get the submodules, but remove it later to not cause side effects
thisdir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, f'{thisdir}')

for a in os.listdir(thisdir):
    dirpath = thisdir + '/' + a
    if os.path.isdir(dirpath):
        if os.path.isfile(dirpath + '/__init__.py'):
            importlib.import_module(a)

# remove so as not to cause side effects
sys.path.remove(f'{thisdir}')
        
