import os
import shutil

def sync_extensions_code():
    thisdir = os.path.dirname(os.path.realpath(__file__))
    E1 = thisdir + '/../python/labbox_ephys/extensions'
    E2 = thisdir + '/labbox_ephys_widgets_jp/src/extensions'
    print(f'Copying extensions/ code from {E1} to {E2}')
    _check_safe_to_delete(E1, E2)
    if os.path.exists(E2):
        shutil.rmtree(E2)
    shutil.copytree(E1, E2)

def _check_safe_to_delete(srcdir: str, dstdir: str):
    dst_fnames = os.listdir(srcdir)
    dst_fnames = [x for x in dst_fnames if (x not in ['__pycache__'])]
    for dst_fname in dst_fnames:
        dst_path = f'{dstdir}/{dst_fname}'
        src_path = f'{srcdir}/{dst_fname}'
        if os.path.isdir(dst_path):
            if os.path.isdir(src_path):
                _check_safe_to_delete(src_path, dst_path)
        elif os.path.isfile(dst_path):
            if os.path.isfile(src_path):
                src_mtime = os.path.getmtime(src_path)
                dst_mtime = os.path.getmtime(dst_path)
                if src_mtime < dst_mtime:
                    print(f'ERROR: {dst_path} is newer than {src_path}')
                    print(f'ERROR: Perhaps you modified a source file in the jupyter extensions directory. Delete your modified files and retry.')
                    raise Exception('Destination file is newer. Perhaps you modified a source file in the jupyter directory. Delete your modified files and retry.')
            
if __name__ == "__main__":
    sync_extensions_code()
