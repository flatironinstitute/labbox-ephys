import React from 'react'
import { Button } from '@material-ui/core'

import { getFeedId, loadText, loadObject, loadBytes, appendMessages, getMessages, getNumMessages, FeedClient, watchForNewMessages } from '../../kachery'

const TestKacheryP2P = () => {
    const _handleTest1 = () => {
        (async () => {
            const feedId = await getFeedId('labbox-ephys-test');
            const numMessages = await getNumMessages({
                feedId,
                subfeedName: 'default'
            })
            console.info(`Num. messages: ${numMessages}`);
            const messages = await getMessages({
                feedId,
                subfeedName: 'default',
                position: 0,
                maxNumMessages: 1000,
                waitMsec: 5000
            })
            for (const msg of messages) {
                console.info(JSON.stringify(msg));
            }
        })();
    }

    const _handleTest2 = () => {
        (async () => {
            const feedId = await getFeedId('labbox-ephys-test')
            await appendMessages({
                feedId,
                subfeedName: 'default',
                messages: [
                    {name: randomString(6), note: 'example messsage'}
                ]
            })
            console.log('appended message.');
        })();
    }

    const _handleTest3 = () => {
        (async () => {
            const txt = await loadText('sha1://ea3b1bd77c52716fa7ec85b7ebe3ae6d30123bdf/README.md');
            console.info('TEXT::', txt);
        })();
    }

    const _handleTest4 = () => {
        (async () => {
            const obj = await loadObject('sha1://5659e7aabdf25db10b0b928a5c56ba2d3de360ee/package.json');
            console.info('OBJECT::', obj);
        })();
    }
    const _handleTest5 = () => {
        (async () => {
            const bytes = await loadBytes(
                'sha1://ea3b1bd77c52716fa7ec85b7ebe3ae6d30123bdf/README.md',
                {start: 0, end: 200}
            );
            console.info('BYTES::', bytes, bytes.length);
        })();
    }
    const _handleTest6 = () => {
        (async () => {
            const feedId = await getFeedId('labbox-ephys-test')
            const feedClient = new FeedClient(feedId);
            const subfeed = feedClient.getSubfeed('default')
            const messages1 = await subfeed.readMessages({waitMsec: 1000});
            console.info(messages1);
            const messages2 = await subfeed.readMessages({waitMsec: 1000});
            console.info(messages2);
        })();
    }
    const _handleTest7 = () => {
        (async () => {
            const feedId = await getFeedId('labbox-ephys-test')
            const feedClient = new FeedClient(feedId);
            const subfeed = feedClient.getSubfeed('default')
            const numMessages = await subfeed.getNumMessages();
            const subfeedWatches = {
                'watch1': {
                    feedId,
                    subfeedName: 'default',
                    position: numMessages
                },
                'watch2': {
                    feedId,
                    subfeedName: 'default2',
                    position: 0
                }
            }
            const messages = await watchForNewMessages({subfeedWatches, waitMsec: 5000});
            console.info(messages);
        })();
    }

    return (
        <div>
            <Button onClick={_handleTest1}>TEST 1: get messages</Button>
            <Button onClick={_handleTest2}>TEST 2: append messages</Button>
            <Button onClick={_handleTest3}>TEST 3: load text</Button>
            <Button onClick={_handleTest4}>TEST 4: load object</Button>
            <Button onClick={_handleTest5}>TEST 5: load bytes</Button>
            <Button onClick={_handleTest6}>TEST 6: feed client</Button>
            <Button onClick={_handleTest7}>TEST 7: feed watch</Button>
        </div>
    );
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const label = 'Test kachery-p2p'

TestKacheryP2P.prototypeViewPlugin = {
    label: label,
    props: {}
}

export default TestKacheryP2P