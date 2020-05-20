import setuptools

setuptools.setup(
    name="loggery",
    version="0.1.0",
    author="Jeremy Magland",
    author_email="jmagland@flatironinstitute.org",
    description="Event streams!",
    packages=setuptools.find_packages(),
    scripts=[],
    install_requires=[
        'requests'
    ],
    classifiers=(
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    )
)
