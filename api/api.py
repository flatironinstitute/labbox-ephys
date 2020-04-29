import sys
from flask import Flask, request
import hither2 as hi
import urllib
import pathlib
import kachery as ka

thisdir = pathlib.Path(__file__).parent.absolute()
sys.path.insert(0, f'{thisdir}/../src')
from actions import functions

app = Flask(__name__)

def decodeURIComponent(x):
    return urllib.parse.unquote(x)

@app.route('/getComputeResourceJobStats')
def getComputeResourceJobStats():
    computeResourceId = request.args.get('computeResourceId')
    mongoUri = decodeURIComponent(request.args.get('mongoUri'))
    databaseName = request.args.get('databaseName')
    database = hi.Database(
        mongo_url=mongoUri,
        database=databaseName
    )
    db = database.collection('hither2_jobs')
    query = dict(
        compute_resource_id=computeResourceId
    )
    docs = [doc for doc in db.find(query)]

    return dict(
        numTotal=len(docs),
        numQueued=len([doc for doc in docs if doc['status'] == 'queued']),
        numRunning=len([doc for doc in docs if doc['status'] == 'running']),
        numFinished=len([doc for doc in docs if doc['status'] == 'finished']),
        numError=len([doc for doc in docs if doc['status'] == 'error'])
    )

@app.route('/getComputeResourceJobs')
def getComputeResourceJobs():
    computeResourceId = request.args.get('computeResourceId')
    mongoUri = decodeURIComponent(request.args.get('mongoUri'))
    databaseName = request.args.get('databaseName')
    database = hi.Database(
        mongo_url=mongoUri,
        database=databaseName
    )
    db = database.collection('hither2_jobs')
    query = dict(
        compute_resource_id=computeResourceId
    )
    projection = {
        '_id': False,
        'job_id': True,
        'handler_id': True,
        'job_serialized.function_name': True,
        'job_serialized.function_version': True,
        'job_serialized.label': True,
        'status': True
    }
    jobs = [
        doc for doc in db.find(query, projection)
    ]

    return dict(
        jobs=jobs
    )

@app.route('/runPythonFunction', methods=['POST'])
def runPythonFunction():
    x = request.json
    functionName = x['functionName']
    kwargs = x['kwargs']
    opts = x['opts']
    kachery_config = opts.get('kachery_config', {})
    assert hasattr(functions, functionName)
    function = getattr(functions, functionName)
    with ka.config(**kachery_config):
        data = function(**kwargs)
    return data