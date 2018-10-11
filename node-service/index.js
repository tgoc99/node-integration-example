const { connect } = require('hadouken-js-adapter');
const fs = require('fs');

//get the OpenFin port as a argument.
const port = process.argv[process.argv.indexOf('--port') + 1];
//incomming message topic.
const toServiceTopic = 'to-service-topic';
//Outgoing message topic.
const toWebTopic = 'to-web-topic';
//The identity of the Web Application.
const webAppIdentity = {
    uuid: 'node-integration-example-web'
};
//conection options
const connectionOptions = {
    address: `ws://localhost:${port}`,
    uuid: 'node-integration-example-service',
    nonPersistant: true
};
let fin;

function onConnected(f) {
    fin = f;
    let start;
    fin.System.getRvmInfo().then(info => {
        console.log(info);
    })

    var filePath = 'C:\\Users\\thomasoconnor\\AppData\\Local\\OpenFin\\apps\\sec_1638792822\\app.log';

    const read = () => {
        const stream = fs.createReadStream(filePath, {encoding: 'utf8', start});

        stream.on('data', data => {
            fin.InterApplicationBus.publish('app-log', data);
        });
        start = fs.statSync(filePath).size;
    };

    setInterval(read, 1000);
}

//connect to the OpenFin runtime.
connect(connectionOptions).then(onConnected).catch(err => console.log(err));