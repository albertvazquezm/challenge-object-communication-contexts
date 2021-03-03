"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedObject = exports.shareObject = void 0;
var mqtt_1 = __importDefault(require("mqtt"));
var object_path_1 = __importDefault(require("object-path"));
var COMMAND;
(function (COMMAND) {
    COMMAND["GET_SHAPE"] = "GET_SHAPE";
    COMMAND["SET_SHAPE"] = "SET_SHAPE";
    COMMAND["GET_PROP"] = "GET_PROP";
})(COMMAND || (COMMAND = {}));
var shareObject = function (objectName, obj) {
    // stores information of the object and how to access the data
    var client = mqtt_1.default.connect('mqtt://broker.emqx.io');
    client.on('connect', function (pack) {
        client.subscribe(objectName);
    });
    client.on('message', function (topic, message) {
        var messageObj = JSON.parse(message.toString());
        switch (messageObj.command) {
            case COMMAND.GET_SHAPE: return client.publish(objectName, JSON.stringify({ command: COMMAND.SET_SHAPE, payload: JSON.stringify(getObjShape(obj)) }));
            case COMMAND.GET_PROP: return console.log('FROM REMOTE OBJECT: THIS IS WHAT YOU REQUESTED: ', object_path_1.default.get(obj, messageObj.payload.accessor));
        }
    });
};
exports.shareObject = shareObject;
var getObjShape = function (obj, prefix) {
    return Object.keys(obj).reduce(function (acc, key) {
        if (typeof obj[key] === 'object') {
            acc[key] = getObjShape(obj[key], key);
        }
        else {
            acc[key] = prefix ? prefix + "." + key : key;
        }
        return acc;
    }, {});
};
var getSharedObject = function (objectName) {
    return new Promise(function (res, rej) {
        console.log('getting shared object ', objectName);
        var client = mqtt_1.default.connect('mqtt://broker.emqx.io');
        client.on('connect', function (pack) {
            console.log('B connected');
            client.subscribe(objectName);
            client.publish(objectName, JSON.stringify({ command: COMMAND.GET_SHAPE }), { qos: 1 });
        });
        client.on('message', function (topic, message) {
            var messageObj = JSON.parse(message.toString());
            switch (messageObj.command) {
                case COMMAND.SET_SHAPE: return res(buildRemoteAccessorObject(JSON.parse(messageObj.payload), function (accessor) {
                    console.log('publish get prop', accessor);
                    client.publish(objectName, JSON.stringify({ command: COMMAND.GET_PROP, payload: { accessor: accessor } }), { qos: 1 });
                    return Promise.resolve();
                }));
            }
        });
    });
};
exports.getSharedObject = getSharedObject;
var buildRemoteAccessorObject = function (objShape, dispatchCommand) {
    return Object.keys(objShape).reduce(function (acc, key) {
        acc[key] = function () { return dispatchCommand(objShape[key]); };
        return acc;
    }, {});
};
