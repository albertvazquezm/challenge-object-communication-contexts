import { getSharedObject } from 'shared-objects';
setTimeout(() => {
    (async () => {
        const remoteObject = await getSharedObject('coolObj') as any;
        console.log('remote object', remoteObject);
        remoteObject.fieldA().then((res: any) => {
            console.log('remote obj prop', res);
        })
        //console.log(await remoteObject.fieldA);
        //console.log(await remoteObject.fieldB);
        /*console.log('123'.match(await remoteObject.fieldC));
        console.log(await remoteObject.someMethod(5));
        const remoteFunction = await remoteObject.someMethodReturningAFunction();
        console.log(await remoteFunction(5));
        await TODO_yourRemoteObjectDisposeFunction(remoteFunction);
        await TODO_yourRemoteObjectDisposeFunction(remoteObject);*/
    })()
}, 3000)


