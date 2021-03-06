import os
import json
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join
import kachery as ka
import kachery_p2p as kp

class Sha1Handler(IPythonHandler):
    def get(self):
        sha1 = self.request.path.split('/')[-1]
        txt = ka.load_text(f'sha1://{sha1}')
        if txt is None:
            raise Exception('Unable to load file.')
        self.finish(txt)

class FeedGetMessagesHandler(IPythonHandler):
    def post(self):
        x = json.loads(self.request.body)
        feed_uri = x['feedUri']
        subfeed_name = x['subfeedName']
        position = x['position']
        if feed_uri:
            feed = kp.load_feed(feed_uri)
        else:
            feed = kp.load_feed(os.environ['LABBOX_DEFAULT_FEED_NAME'], create=True)
        subfeed = feed.get_subfeed(subfeed_name)
        subfeed.set_position(position)
        messages = subfeed.get_next_messages()
        txt = json.dumps(messages)
        self.finish(txt)

class FeedAppendMessagesHandler(IPythonHandler):
    def post(self):
        x = json.loads(self.request.body)
        feed_uri = x['feedUri']
        subfeed_name = x['subfeedName']
        messages = x['messages']
        if feed_uri:
            feed = kp.load_feed(feed_uri)
        else:
            feed = kp.load_feed(os.environ['LABBOX_DEFAULT_FEED_NAME'], create=True)
        subfeed = feed.get_subfeed(subfeed_name)
        subfeed.append_messages(messages)
        txt = json.dumps({'success': True})
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

    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/feed/getMessages')
    web_app.add_handlers(host_pattern, [(route_pattern, FeedGetMessagesHandler)])

    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/feed/appendMessages')
    web_app.add_handlers(host_pattern, [(route_pattern, FeedAppendMessagesHandler)])