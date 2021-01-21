from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join
import kachery as ka

class Sha1Handler(IPythonHandler):
    def get(self):
        sha1 = self.request.path.split('/')[-1]
        txt = ka.load_text(f'sha1://{sha1}')
        if txt is None:
            raise Exception('Unable to load file.')
        self.finish(txt)

def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/sha1/.*')
    web_app.add_handlers(host_pattern, [(route_pattern, Sha1Handler)])