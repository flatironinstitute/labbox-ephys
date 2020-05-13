class File {
    constructor(path) {
        this._path = path;
    }
    serialize() {
        return {
            _type: '_hither_file',
            path: this._path
        };
    }
}

File.deserialize = (x) => {
    if (x._type === '_hither_file') {
        return new File(x.path);
    }
    else {
        throw Error('Problem deserializing File object:', x);
    }
}

export default File;