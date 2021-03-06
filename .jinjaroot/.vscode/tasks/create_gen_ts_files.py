#!/usr/bin/env python3

import os
import json
from typing import List

# For every file that also has a .gen.ts file, generate the .gen.ts file so that the text can be imported via `import x from './---.gen'`
# The previous raw.macro solution did not work with jupyter extension
def create_gen_ts_files(folder: str) -> None:
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
                create_gen_ts_files(folder + '/' + a)

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
    thisdir = os.path.dirname(os.path.realpath(__file__))
    create_gen_ts_files(f'{thisdir}/../..')