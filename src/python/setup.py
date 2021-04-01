import codecs
import os.path

import setuptools

setuptools.setup(
    packages=setuptools.find_packages(),
    include_package_data=True,
    scripts=[
        "bin/labbox-ephys",
        "bin/labbox-ephys-services"
    ],
    install_requires=[
        'numpy',
        'scipy',
        'h5py',
        'spikeextractors>=0.9.2',
        'spiketoolkit>=0.7.1',
        "aiohttp",
        "aiohttp_cors",
        'labbox>=0.1.32',
        'jinjaroot>=0.0.2' # for code generation
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ]
)
