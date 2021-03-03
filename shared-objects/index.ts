import { access } from 'fs';
import mqtt from 'mqtt';
import objectPath from 'object-path';

enum COMMAND {
    GET_SHAPE = 'GET_SHAPE',
    SET_SHAPE = 'SET_SHAPE',
    GET_PROP = 'GET_PROP'
}


export const shareObject = (objectName: string, obj: any) => {
    // stores information of the object and how to access the data
    console.log('sharing object ', objectName);

    const client = mqtt.connect('mqtt://broker.emqx.io');

    client.on('connect', (pack) => {
        client.subscribe(objectName)
    })

    client.on('message', function (topic, message) {
        const messageObj = JSON.parse(message.toString());
        console.log('A onmessage', messageObj)
        switch (messageObj.command) {
            case COMMAND.GET_SHAPE: return client.publish(objectName, JSON.stringify({ command: COMMAND.SET_SHAPE, payload: JSON.stringify(getObjShape(obj)) }))
            case COMMAND.GET_PROP: return console.log('this is what you requested!!!', objectPath.get(obj, messageObj.payload.accessor))
        }
    })

    /*realObj = obj;
    stubObj = Object.keys(obj).reduce((newObj: any, key) => {
        const val = obj[key];
        newObj[key] = getObjProp(key)
        return newObj;
    }, {});*/
}

const getObjShape = (obj: any, prefix?: string) => {
    return Object.keys(obj).reduce((acc: any, key) => {
        console.log(`typeof`, typeof obj[key]);

        if (typeof obj[key] === 'object') {
            acc[key] = getObjShape(obj[key], key);
        } else {
            acc[key] = prefix ? `${prefix}.${key}` : key;
        }
        return acc;
    }, {})
}

export const getSharedObject = (objectName: string) => {
    return new Promise((res, rej) => {

        console.log('getting shared object ', objectName);
        const client = mqtt.connect('mqtt://broker.emqx.io');

        client.on('connect', (pack) => {
            console.log('B connected');
            client.subscribe(objectName);
            client.publish(objectName, JSON.stringify({ command: COMMAND.GET_SHAPE }), { qos: 1 });
        })

        client.on('message', function (topic, message) {
            const messageObj: { command: COMMAND, payload: string } = JSON.parse(message.toString());
            console.log('ONMESSAGE', messageObj);
            switch (messageObj.command) {
                case COMMAND.SET_SHAPE: return res(buildRemoteAccessorObject(JSON.parse(messageObj.payload), (accessor: string) => {
                    console.log('publish get prop', accessor)
                    client.publish(objectName, JSON.stringify({ command: COMMAND.GET_PROP, payload: { accessor } }), { qos: 1 });
                    return Promise.resolve();
                }));
            }
        })

    })


    //return Promise.resolve(stubObj);
}

const buildRemoteAccessorObject = (objShape: any, dispatchCommand: (accessor: string) => Promise<any>) => {
    console.log('shape', Object.keys(objShape));
    return Object.keys(objShape).reduce((acc: any, key) => {
        acc[key] = () => dispatchCommand(objShape[key])
        return acc;
    }, {})
}