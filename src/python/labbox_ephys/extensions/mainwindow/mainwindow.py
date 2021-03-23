import hither2 as hi
import numpy as np

# @hi.function('createjob_test_hello_ext1', '0.1.0')
# def createjob_test_hello_ext1(labbox, x: float):
#     jh = labbox.get_job_handler('partition1')
#     jc = labbox.get_job_cache()
#     with hi.Config(
#         job_cache=jc,
#         job_handler=jh,
#         container=jh.is_remote()
#     ):
#         return test_hello_ext1.run(x=x)

# @hi.function('test_hello_ext1', '0.1.0')
# def test_hello_ext1(x: float):
#     return x + 1