//Incomming message topic.
const toWebTopic = 'to-web-topic';
//OutGoing message topic.
const toServiceTopic = 'to-service-topic';
//The identity of the Node Service.
const serviceUuid = 'node-integration-example-service';
//the asset alias for the node service (found in the app.json)
const nodeServiceAlias = 'node-service';

//retreives the port for the current OpenFin process
function getPort() {
    return new Promise((resolve, reject) => {
        chrome.desktop.getDetails(d => resolve(d.port));
    });
}

//launches the node-service
function launchNodeService(port) {
    return new Promise((resolve, reject) => {
        fin.desktop.System.launchExternalProcess({
            alias: nodeServiceAlias,
            arguments: 'index.js --port ' + port,
            lifetime: 'window'
        }, resolve
        , (reason, error) => reject(error));
    });
}

function sendIABMessage() {
    fin.desktop.InterApplicationBus.send(serviceUuid, toServiceTopic, {
        data: 'Hello Service',
        timeStamp: Date.now()
    });
}

function onFinReady() {
    const messageCtrl = document.querySelector('#message');
    const timeStampCtrl = document.querySelector('#time');

    //subscribe to messages from the node service
    fin.desktop.InterApplicationBus.subscribe(serviceUuid, toWebTopic, (msg, uuid) => {
        messageCtrl.innerText = `Received ${msg.data} from ${uuid}`;
        timeStampCtrl.innerText = new Date(msg.timeStamp).toLocaleTimeString();
    });

    //launch the node service.
    getPort()
    .then(launchNodeService)
    .then(() => console.log('node service is running'))
    .catch(err => console.log(err));

    //send messages every second.
    setInterval(sendIABMessage, 1000);
}

//Once OpenFin is ready.
fin.desktop.main(onFinReady);
