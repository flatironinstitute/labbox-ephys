import codecs
import os.path

import setuptools


def read(rel_path):
    here = os.path.abspath(os.path.dirname(__file__))
    with codecs.open(os.path.join(here, rel_path), 'r') as fp:
        return fp.read()

def get_version(rel_path):
    for line in read(rel_path).splitlines():
        if line.startswith('__version__'):
            delim = '"' if '"' in line else "'"
            return line.split(delim)[1]
    else:
        raise RuntimeError("Unable to find version string.")


pkg_name = "labbox_ephys"

setuptools.setup(
    name=pkg_name,
    version=get_version("labbox_ephys/__init__.py"),
    author="Jeremy Magland",
    author_email="jmagland@flatironinstitute.org",
    description="Run batches of Python functions in containers and on remote servers",
    url="https://github.com/laboratorybox/labbox-ephys",
    packages=setuptools.find_packages(),
    include_package_data=True,
    scripts=[
        "bin/labbox-ephys"
    ],
    install_requires=[
        'numpy',
        'scipy',
        'h5py',
        'spikeextractors>=0.9.2',
        'spiketoolkit>=0.7.1',
        "aiohttp",
        "aiohttp_cors",
        'labbox==0.1.21'
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ]
)
