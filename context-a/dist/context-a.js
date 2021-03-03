"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shared_objects_1 = require("shared-objects");
var localVariable = 123;
var remoteObject = {
    fieldA: 'a',
    fieldB: 1,
    fieldC: /\d+/,
    fieldD: { prop1: 'b', prop2: 'c' },
    someMethod: function (value) {
        return localVariable + value;
    },
    someMethodReturningAFunction: function () {
        return function (value) {
            return localVariable + value;
        };
    }
};
shared_objects_1.shareObject('coolObj', remoteObject);
//TODO_yourRemoteObjectProviderFunction('objectName', remoteObject);
