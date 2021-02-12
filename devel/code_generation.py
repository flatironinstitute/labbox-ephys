#!/usr/bin/env python

import json
import os
from os.path import isdir
from typing import Dict, List, NamedTuple, Union

from jinja2 import Template

dry_run = False

def main():
    extensions = get_extensions('src', '.')

    output_fnames = find_files_with_templates('.')
    print(f'Found {len(output_fnames)} files with templates')
    print(dict(extensions=extensions))
    for output_fname in output_fnames:
        process_template(output_fname, template_kwargs=dict(extensions=extensions))
    
    create_text_ts_files('.')

def find_files_with_templates(folder: str) -> List[str]:
    ret: List[str] = []
    for a in os.listdir(folder):
        fname = folder + '/' + a
        template_fname = fname + '.j2'
        if (a.endswith('.ts') or a.endswith('.tsx')) and os.path.exists(template_fname):
            with open(template_fname, 'r') as f:
                template_code = f.read()
            if '!begin-code-generation!' in template_code:
                ret.append(fname)
        if os.path.isdir(fname):
            if a not in ['node_modules', '.git', '.vscode', '__pycache__']:
                for b in find_files_with_templates(folder + '/' + a):
                    ret.append(b)
    return ret

def process_template(output_fname, template_kwargs):
    template_fname = output_fname + '.j2'

    update_template(template_fname, output_fname)

    print(f'Reading from template file: {template_fname}')
    with open(template_fname, 'r') as f:
        template_code = f.read()

    t = Template(template_code)
    gen_code = t.render(**template_kwargs)
    gen_code = gen_code + f'''

// !note! This file involves code generation.
// !note! The following template file was used: {template_fname}
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
'''

    if not dry_run:
        _write_file_if_changed(output_fname, gen_code)

def update_template(template_fname: str, output_fname: str) -> None:
    with open(template_fname, 'r') as f:
        template_code = f.read()
    with open(output_fname, 'r') as f:
        output_code = f.read()
    template_code_sections = split_into_sections(template_code)
    output_code_sections = split_into_sections(output_code)
    update_template_code_sections(template_code_sections, output_code_sections)
    new_template_code = combine_sections(template_code_sections)
    if new_template_code != template_code:
        print(f'**** Updating template file: {template_fname}')
        print(new_template_code)
        if not dry_run:
            _write_file_if_changed(template_fname, new_template_code)

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
class SectionInfo(NamedTuple):
    code: str
    generation: bool

def update_template_code_sections(template_code_sections: List[SectionInfo], output_code_sections: List[SectionInfo]) -> None:
    if len(template_code_sections) != len(output_code_sections):
        raise Exception('Mismatch between sections in template and output')
    for i in range(len(template_code_sections)):
        if output_code_sections[i].generation:
            if not template_code_sections[i].generation:
                raise Exception('Mismatch between sections in template and output')
        else:
            if template_code_sections[i].generation:
                raise Exception('Mismatch between sections in template and output')
            template_code_sections[i] = SectionInfo(code=output_code_sections[i].code, generation=template_code_sections[i].generation)
    # strip whitespace at end of last section
    template_code_sections[-1] = SectionInfo(code=template_code_sections[-1].code.rstrip(), generation=template_code_sections[-1].generation)

def split_into_sections(code: str) -> List[SectionInfo]:
    sections = []
    lines = code.split('\n')
    last_section = SectionInfo(code='', generation=True)
    buflines: List[str] = []
    for line in lines:
        if '!note!' not in line:
            if last_section.generation:
                if '!' + 'begin-code-generation' + '!' in line:
                    section = SectionInfo(code = '\n'.join(buflines), generation=False)
                    sections.append(section)
                    last_section = section
                    buflines = [line]
                else:
                    buflines.append(line)
            else:
                if '!' + 'end-code-generation' + '!' in line:
                    buflines.append(line)
                    section = SectionInfo(code = '\n'.join(buflines), generation=True)
                    sections.append(section)
                    last_section = section
                    buflines = []
                else:
                    buflines.append(line)
    if last_section.generation:
        section = SectionInfo(code = '\n'.join(buflines), generation=True)
        sections.append(section)
        last_section = section
        buflines = []
    if len(buflines) > 0:
        raise Exception('Unexpected additional lines at end of file.')
    return sections

def combine_sections(sections: List[SectionInfo]) -> str:
    return '\n'.join([s.code for s in sections])

def get_extensions(realpath: str, relpath: str) -> List[Dict]:
    ret = []
    for x in os.listdir(realpath):
        path = realpath + '/' + x
        if x.endswith('.tsx'):
            extension_data = get_extension_data(path)
            if extension_data is not None:
                extension_name = extension_data['name']
                extension_tags = extension_data['tags']
                relpath = relpath + '/' + x[:len(x) - 4]
                print(f'Found extension: {extension_name} at {relpath}')
                ret.append(dict(
                    name=extension_name,
                    tags=extension_tags,
                    relPath=relpath
                ))
        if os.path.isdir(path):
            for a in get_extensions(realpath + '/' + x, relpath + '/' + x):
                ret.append(a)
    return ret

def get_extension_data(path: str) -> Union[dict, None]:
    with open(path, 'r') as f:
        code: str = f.read()
    lines = code.split('\n')
    ret = {
        'name': None,
        'tags': []
    }
    found = False
    for line in lines:
        a = 'LABBOX-EXTENSION:'
        try:
            ind = line.index(a)
            name = line[ind + len(a):].strip()
            found = True
            ret['name'] = name
        except:
            pass
        a = 'LABBOX-EXTENSION-TAGS:'
        try:
            ind = line.index(a)
            tags_str = line[ind + len(a):].strip()
            ret['tags'] = tags_str.split()
        except:
            pass
    if found:
        return ret
    else:
        return None


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
