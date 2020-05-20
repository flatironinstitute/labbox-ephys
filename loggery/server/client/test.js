import EventStreamClient from '../client/EventStreamClient.js'

async function main() {
    const client = new EventStreamClient(`http://localhost:${process.env.PORT}`, 'readwrite', 'readwrite');
    const S = client.getStream({name: 'stream1'});
    const events = await S.readEvents();
    console.info(events.length);
    await S.writeEvent({eventNum: 1});
    const events2 = await S.readEvents();
    for (let e of events2) {
        console.info(e);
    }
}

main();