#!/usr/bin/env python

import os
from os.path import isdir

from jinja2 import Template


def main():
    in_fname = './src/registerExtensions.ts.j2'
    print(f'Reading from template file: {in_fname}')
    with open(in_fname, 'r') as f:
        template_code = f.read()

    extensions = get_extensions('src', '.')

    t = Template(template_code)
    gen_code = t.render(extensions=extensions)

    out_fname = './src/registerExtensions.ts'
    with open(out_fname, 'w') as f:
        f.write(gen_code)
    print(f'Wrote file: {out_fname}')

def get_extensions(realpath, relpath):
    ret = []
    for x in os.listdir(realpath):
        path = realpath + '/' + x
        if x.endswith('.tsx'):
            extension_name = get_extension_name(path)
            if extension_name is not None:
                relpath = relpath + '/' + x[:len(x) - 4]
                print(f'Found extension: {extension_name} at {relpath}')
                ret.append({
                    'name': extension_name,
                    'relPath': relpath
                })
        if os.path.isdir(path):
            for a in get_extensions(realpath + '/' + x, relpath + '/' + x):
                ret.append(a)
    return ret

def get_extension_name(path):
    with open(path, 'r') as f:
        code: str = f.read()
    lines = code.split('\n')
    for line in lines:
        a = 'LABBOX-EXTENSION:'
        try:
            ind = line.index(a)
            name = line[ind + len(a):].strip()
            return name
        except:
            pass
    return None




if __name__ == '__main__':
    main()
