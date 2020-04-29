import sys
import traceback
from flask import Flask, request
import hither2 as hi
import urllib
import pathlib
import kachery as ka

# this is how the hither functions get registered
thisdir = pathlib.Path(__file__).parent.absolute()
sys.path.insert(0, f'{thisdir}/../src')
import actions

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

@app.route('/runHitherJob', methods=['POST'])
def runHitherJob():
    x = request.json
    functionName = x['functionName']
    kwargs = x['kwargs']
    opts = x['opts']
    kachery_config = opts.get('kachery_config', {})
    hither_config = opts.get('hither_config', {})
    with ka.config(**kachery_config):
        with hi.config(**hither_config):
            job = hi.run(functionName, **kwargs)
            try:
                job.wait()
            except Exception as e:
                traceback.print_exc()
                return dict(
                    error=True,
                    error_message=str(job.exception()),
                    runtime_info=job.runtime_info()
                )
    return dict(
        error=False,
        result=job.result(),
        runtime_info=job.runtime_info()
    )