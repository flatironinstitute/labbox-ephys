#!/usr/bin/env python3

from genericpath import exists
import os
import json
from typing import List
import yaml
from jinja2 import Template
from copy import deepcopy

def main():
    thisdir = os.path.dirname(os.path.realpath(__file__))
    with open(f'{thisdir}/code_generation.yaml') as f:
        code_generation_yaml = yaml.safe_load(f)
    template_kwargs = {}
    for k, v in code_generation_yaml.items():
        template_kwargs[k] = v
    if 'projectName' in template_kwargs:
        template_kwargs['projectNameUnderscore'] = template_kwargs['projectName'].replace('-', '_')
    
    template_folder = f'{thisdir}/templates'
    dest_folder = f'{thisdir}/..'
    generate(template_folder=template_folder, dest_folder=dest_folder, template_kwargs=template_kwargs)

    generate2(dest_folder=dest_folder, template_kwargs=template_kwargs)

    create_text_ts_files(f'{thisdir}/../src')

# For every file that also has a .gen.ts file, generate the .gen.ts file so that the text can be imported via `import x from './---.gen'`
# The previous raw.macro solution did not work with jupyter extension
def create_text_ts_files(folder: str) -> None:
    ret: List[str] = []
    for a in os.listdir(folder):
        fname = folder + '/' + a
        fname2 = fname + '.gen.ts'
        if os.path.exists(fname2):
            with open(fname, 'r') as f:
                txt = f.read()
            new_txt = f'const text: string = {json.dumps(txt)}\n\nexport default text'
            _write_file_if_changed(fname2, new_txt)
        if os.path.isdir(fname):
            if a not in ['node_modules', '.git', '.vscode', '__pycache__']:
                create_text_ts_files(folder + '/' + a)

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
            gen_code = add_gen_header(fname, gen_code, header_msg1)
            if gen_code != dest_code:
                with open(dest_path, 'w') as f:
                    print(f'Writing {dest_path}')
                    f.write(gen_code)
            if (dest_stat is None) or (template_stat.st_mode != dest_stat.st_mode):
                os.chmod(dest_path, template_stat.st_mode)

def ends_with(fname, suffixes):
    for suf in suffixes:
        if fname.endswith(suf): return True
    return False

def add_gen_header(fname: str, code: str, message: str):
    if ends_with(fname, ['.js', '.jsx', '.ts', '.tsx']):
        return f'// {message}\n\n{code}'
    elif ends_with(fname, ['.py', '.sh', '.yaml', '.yml', '.cfg']):
        return f'# {message}\n\n{code}'
    elif ends_with(fname, ['.md']):
        return f'<!-- {message} -->\n\n{code}'
    else:
        return code

header_msg1 = 'This file was automatically generated. Do not edit directly. See devel/templates.'
header_msg2 = 'This file was automatically generated. Do not edit directly.'

def generate2(*, dest_folder: str, template_kwargs: dict):
    dest_fnames = os.listdir(dest_folder)
    for fname in dest_fnames:
        dest_path = f'{dest_folder}/{fname}'
        if os.path.isdir(dest_path):
            generate2(dest_folder=dest_path, template_kwargs=template_kwargs)
        elif os.path.isfile(dest_path):
            if ends_with(dest_path, ['.ts', '.tsx', '.js', '.jsx', '.py', '.cfg', '.md', '.sh', '.yml', '.yaml']):
                template_path = dest_path + '.j2'
                if os.path.exists(template_path):
                    if os.path.exists(template_path + '.yaml'):
                        with open(template_path + '.yaml', 'r') as f:
                            additional_template_kwargs = yaml.safe_load(f)
                    elif os.path.exists(template_path + '.json'):
                        with open(template_path + '.json', 'r') as f:
                            additional_template_kwargs = json.load(f)
                    else:
                        additional_template_kwargs = {}
                    with open(template_path, 'r') as f:
                        template_code = f.read()
                    with open(dest_path, 'r') as f:
                        dest_code = f.read()
                    t = Template(template_code, keep_trailing_newline=True)
                    gen_code = t.render(**template_kwargs, **additional_template_kwargs)
                    gen_code = add_gen_header(fname, gen_code, header_msg2)
                    if gen_code != dest_code:
                        with open(dest_path, 'w') as f:
                            print(f'Writing {dest_path}')
                            f.write(gen_code)
            if ends_with(dest_path, ['.json']):
                substitute_template_path = dest_path + '.substitute.j2'
                if os.path.exists(substitute_template_path):
                    with open(dest_path, 'r') as f:
                        content1 = json.load(f)
                    with open(substitute_template_path, 'r') as f:
                        txt = f.read()
                        txt2 = Template(txt, keep_trailing_newline=True).render(**template_kwargs)
                        content2 = json.loads(txt2)
                    content1_new = _substitute_json(content1, content2)
                    gen_code = json.dumps(content1_new, indent=2)
                    with open(dest_path, 'r') as f:
                        dest_code = f.read()
                    if gen_code != dest_code:
                        with open(dest_path, 'w') as f:
                            print(f'Writing {dest_path}')
                            f.write(gen_code)

def _substitute_json(content1: dict, content2: dict):
    ret = deepcopy(content1)
    for k, v in content2.items():
        ret[k] = v
    return ret

def _write_file_if_changed(fname, txt):
    if os.path.exists(fname):
        with open(fname, 'r') as f:
            old_text = f.read()
    else:
        old_text = None
    if txt != old_text:
        print(f'Writing {fname}')
        with open(fname, 'w') as f:
            f.write(txt)

if __name__ == '__main__':
    main()