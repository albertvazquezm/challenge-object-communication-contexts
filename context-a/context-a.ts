import {getSharedObject, shareObject} from 'shared-objects';

const localVariable = 123;
const remoteObject = {
    fieldA: 'a',
    fieldB: 1,
    fieldC: /\d+/,
    fieldD: {prop1: 'b', prop2: 'c'},
    someMethod: (value: number) => {
        return localVariable + value;
    },
    someMethodReturningAFunction: () => {
        return function (value: number) {
            return localVariable + value;
        };
    }
};

shareObject('coolObj', remoteObject);

//TODO_yourRemoteObjectProviderFunction('objectName', remoteObject);
