#!/usr/bin/env python3

import os
import json
import yaml
from jinja2 import Template

def main():
    thisdir = os.path.dirname(os.path.realpath(__file__))
    with open(f'{thisdir}/../package.json') as f:
        package_json = json.load(f)
    with open(f'{thisdir}/code_generation.yaml') as f:
        code_generation_yaml = yaml.safe_load(f)
    template_kwargs = {
        'projectName': package_json['name'],
        'projectNameUnderscore': package_json['name'].replace('-', '_'),
        'projectVersion': package_json['version']
    }
    for k, v in code_generation_yaml.items():
        template_kwargs[k] = v
    
    template_folder = f'{thisdir}/templates'
    dest_folder = f'{thisdir}/..'
    generate(template_folder=template_folder, dest_folder=dest_folder, template_kwargs=template_kwargs)

def generate(*, template_folder: str, dest_folder: str, template_kwargs: dict):
    template_fnames = os.listdir(template_folder)
    for fname in template_fnames:
        template_path = f'{template_folder}/{fname}'
        fname2 = fname.replace('$projectName$', template_kwargs['projectName']).replace('$projectNameUnderscore$', template_kwargs['projectNameUnderscore'])
        dest_path = f'{dest_folder}/{fname2}'
        if os.path.isdir(template_path):
            if not os.path.exists(dest_path):
                os.mkdir(dest_path)
            generate(template_folder=template_path, dest_folder=dest_path, template_kwargs=template_kwargs)
        elif os.path.isfile(template_path):
            with open(template_path, 'r') as f:
                template_code = f.read()
            template_stat = os.stat(template_path)
            if os.path.exists(dest_path):
                with open(dest_path, 'r') as f:
                    dest_code = f.read()
                dest_stat = os.stat(dest_path)
            else:
                dest_code = None
                dest_stat = None
            t = Template(template_code, keep_trailing_newline=True)
            gen_code = t.render(**template_kwargs)
            gen_code = add_gen_header(fname, gen_code)
            if gen_code != dest_code:
                with open(dest_path, 'w') as f:
                    print(f'Writing {dest_path}')
                    f.write(gen_code)
            if (dest_stat is None) or (template_stat.st_mode != dest_stat.st_mode):
                os.chmod(dest_path, template_stat.st_mode)

def is_js_type(fname: str):
    return fname.endswith('.ts') or fname.endswith('.tsx') or fname.endswith('.js') or fname.endswith('.jsx')

def is_py_type(fname: str):
    return fname.endswith('.py')

def is_sh_type(fname: str):
    return fname.endswith('.sh')

def add_gen_header(fname: str, code: str):
    msg = 'This file was automatically generated. Do not edit directly. See devel/templates.'
    if is_js_type(fname):
        return f'// {msg}\n\n{code}'
    elif is_py_type(fname) or is_sh_type(fname):
        return f'# {msg}\n\n{code}'
    else:
        return code

if __name__ == '__main__':
    main()