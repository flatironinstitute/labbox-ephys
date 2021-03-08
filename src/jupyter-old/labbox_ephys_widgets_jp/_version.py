#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jeremy Magland.
# Distributed under the terms of the Modified BSD License.

# Do it this way so we can update the version string with find/replace, and still have version info
version_str = '0.5.4'

version_info = tuple([int(x) for x in version_str.split('.')])
__version__ = ".".join(map(str, version_info))
