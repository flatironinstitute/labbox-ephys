import { WidgetModel } from '@jupyter-widgets/base';
import '../css/styles.css';
import '../css/widget.css';
import { HitherInterface } from './extensions/common/hither';
import { sleepMsec } from './extensions/common/misc';
import initializeHitherInterface from './extensions/initializeHitherInterface';

const initializeHitherForJpWidgetView = (model: WidgetModel): {hither: HitherInterface, cleanup: () => void} => {
    const baseSha1Url = `/sha1`
    const hither = initializeHitherInterface(baseSha1Url)
    hither._registerSendMessage(msg => {
        console.info('SENDING MESSAGE', msg)
        if (msg.type === 'hitherCreateJob') _startIterating(300)
        model.send(msg, {})
    })
    model.on('msg:custom', (msgs: any[]) => {
        console.info('RECEIVED MESSAGES', msgs)
        if (msgs.length > 0) {
            _startIterating(300) // start iterating more often if we got a message from the server (because there's activity)
        }
        for (let msg of msgs) {
            if (msg.type === 'hitherJobCreated') {
                hither.handleHitherJobCreated(msg)
            }
            else if (msg.type === 'hitherJobFinished') {
                hither.handleHitherJobFinished(msg)
            }
            else if (msg.type === 'hitherJobError') {
                hither.handleHitherJobError(msg)
            }
            else if (msg.type === 'debug') {
                console.info('DEBUG MESSAGE', msg)
            }
        }
    })
    let _iterating = false
    let _iterate_interval = 200
    const _startIterating = (interval: number) => {
        _iterate_interval = interval
        if (_iterating) {
            model.send({ type: 'iterate' }, {})
            return
        }
        _iterating = true
            ; (async () => {
                while (_iterating) {
                    // if (hither.getNumActiveJobs() === 0) { // don't do this anymore because we also need to handle updates to kachery feeds
                    //     _iterating = false
                    //     return
                    // }
                    model.send({ type: 'iterate' }, {})
                    await sleepMsec(_iterate_interval)
                    _iterate_interval = Math.min(5000, _iterate_interval + 50) // decrease the rate of iteration over time
                }
            })()
    }
    _startIterating(300)
    const cleanup = () => {
        _iterating = false
    }
    return {hither, cleanup}
}

export default initializeHitherForJpWidgetView