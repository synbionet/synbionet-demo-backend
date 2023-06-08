import { assert, test } from 'vitest'

import { ExchangeState } from './types';
import { connect, createDbTables, listExchanges, listServices, saveEvent } from "./db";

test('db service', async () => {
    let pool = connect();
    await createDbTables(pool);

    let ok = await saveEvent(pool, {
        event: 'ServiceCreated', data: {
            id: 11,
            owner: 'bob',
            name: 'my cool service',
            active: true,
            when: 1234,
            uri: 'ipfs//serviceinformation'
        }
    });
    assert.isTrue(ok);
    let r = await listServices(pool);
    assert.equal(1, r.length);

    // update
    let ok1 = await saveEvent(pool, {
        event: 'ServiceMetadataUpdated', data: {
            id: 11,
            when: 1236,
            uri: 'ipfs//serviceinformationUPDATED'
        }
    });
    assert.isTrue(ok1);
    let r1 = await listServices(pool);
    assert.equal(1, r1.length);

    let service = r1[0];
    assert.deepEqual(service.id, 11);
    assert.deepEqual(service.uri, 'ipfs//serviceinformationUPDATED');

});

test('db exchange', async () => {
    let pool = connect();
    await createDbTables(pool);

    let ok = await saveEvent(pool, {
        event: 'Offered', data: {
            id: 1,
            serviceId: 2,
            state: ExchangeState.Offered,
            buyer: 'bob',
            seller: 'alice',
            moderator: 'tom',
            price: 10e6,
            when: 1234,
            uri: 'ipfs//hello'
        }
    });
    assert.isTrue(ok);
    let r = await listExchanges(pool);
    assert.equal(1, r.length);

    // update
    let ok1 = await saveEvent(pool, {
        event: 'Offered', data: {
            id: 1,
            serviceId: 2,
            state: ExchangeState.Funded,
            price: 30e6,
            when: 1236,
        }
    });
    assert.isTrue(ok1);
    let r1 = await listExchanges(pool);
    assert.equal(1, r1.length);

    let exchange = r1[0];
    assert.deepEqual(1, exchange.id);
    assert.deepEqual(30e6, exchange.price);
    assert.deepEqual(1236, exchange.when);
    assert.deepEqual(ExchangeState.Funded, exchange.state);
});