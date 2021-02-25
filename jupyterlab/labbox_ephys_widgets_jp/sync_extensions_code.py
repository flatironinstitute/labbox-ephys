import os
import shutil


# Checks if the folders are identical. If so we are good. If not:
# If we are in a dev workspace (as evidenced by a file existing), then we raise an exception.
# If we are not in a dev workspace, then we remove any existing extensions/ folder and replace it with a new one.
def sync_extensions_code():
    def check_identical_file_content(path1: str, path2: str):
        with open(path1, 'r') as f:
            content1 = f.read()
        with open(path2, 'r') as f:
            content2 = f.read()
        return (content1 == content2)

    def check_identical_dir_content(d1: str, d2: str):
        if not os.path.isdir(d1):
            print(f'Directories not equal: Not a directory: {d1}')
            return False
        if not os.path.isdir(d2):
            print(f'Directories not equal: Not a directory: {d2}')
            return False

        excludes = '__pycache__'
        f1 = [a for a in os.listdir(d1) if a not in excludes]
        f2 = [a for a in os.listdir(d2) if a not in excludes]
        if len(f1) != len(f2):
            print(f'Directories not equal: in {d1} and {d2}')
            return False
        for a in f1:
            if a not in f2:
                return False
            path1 = d1 + '/' + a
            path2 = d2 + '/' + a
            if os.path.isfile(path1):
                if not os.path.isfile(path2):
                    print(f'Directories not equal: Missing file: {path2}')
                    return False
                if not check_identical_file_content(path1, path2):
                    print(f'Directories not equal: files are not the same: {path1} {path2}')
                    return False
            elif os.path.isdir(path1):
                if not os.path.isdir(path2):
                    print(f'Directories not equal: not a directory: {path2}')
                    return False
                if not check_identical_dir_content(path1, path2):
                    return False
        return True
        
    thisdir = os.path.dirname(os.path.realpath(__file__))
    development_workspace = os.path.exists('../codesync.txt')
    E1 = thisdir + '/../../src/python/labbox_ephys/extensions'
    E2 = thisdir + '/src/extensions'
    if check_identical_dir_content(E1, E2):
        print('Code for extensions/ already in sync')
    else:
        if development_workspace:
            print(f'The following directories are not in sync: {E1} {E2}')
            print(f'This appears to be a development workspace because the ../codesync.txt file exists.')
            print(f'To resolve this issue, synchronize the two directories, or remove ../codesync.txt')
            raise Exception('The extensions directories are not in sync. See warnings above.')
        else:
            print(f'Copying extensions/ code from {E1} to {E2}')
            if os.path.exists(E2):
                shutil.rmtree(E2)
            shutil.copytree(E1, E2)

if __name__ == "__main__":
    sync_extensions_code()
