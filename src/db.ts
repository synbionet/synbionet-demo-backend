import { knex, Knex } from 'knex';
import { EventContainer, ExchangeInfo, ServiceInfo } from './types';

export const SERVICE_TABLE = 'service';
export const EXCHANGE_TABLE = 'exchange';

/**
 * 
 * @returns Connection to an in-memory SQLite database
 */
export const connect = (): Knex => knex({
    client: 'better-sqlite3',
    connection: {
        filename: ":memory:"
    },
    useNullAsDefault: true
});

/**
 * Create the tables
 * @param connection
 */
export async function createDbTables(connection: Knex): Promise<void> {
    await connection.schema
        .createTable(SERVICE_TABLE, (table) => {
            table.integer('id').primary;
            table.string('owner');
            table.string('name');
            table.string('uri');
            table.boolean('active').defaultTo(false);
            table.integer('when').defaultTo(0);
        })
        .createTable(EXCHANGE_TABLE, (table) => {
            table.integer('id').primary;
            table.integer('serviceId');
            table.integer('state').defaultTo(0);
            table.string('buyer');
            table.string('seller');
            table.string('moderator');
            table.integer('price').defaultTo(0);
            table.integer('refundType').defaultTo(0);
            table.string('signer');
            table.integer('when').defaultTo(0);
            table.string('uri');
        });
}


async function createOrUpdate(
    connection: Knex,
    tableName: string,
    info: ServiceInfo | ExchangeInfo): Promise<boolean> {
    const result = await
        connection.table(tableName).where({ 'id': info.id });
    try {
        if (result.length == 0) {
            await connection.table(tableName).insert(info);
        } else {
            await connection.table(tableName).where({ id: info.id }).update(info);
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function saveEvent(
    connection: Knex,
    params: EventContainer): Promise<boolean> {
    const evtType = params.event;
    const data = params.data;
    let result = false;

    if (evtType.startsWith("Service")) {
        result = await createOrUpdate(connection, SERVICE_TABLE, data);
    } else {
        // all other events (for now) are the exchange
        result = await createOrUpdate(connection, EXCHANGE_TABLE, data);
    }
    return result;
}

export async function listExchanges(connection: Knex): Promise<Array<ExchangeInfo> | []> {
    return await connection.select().from<ExchangeInfo>(EXCHANGE_TABLE);
}

export async function listServices(connection: Knex): Promise<Array<ServiceInfo> | []> {
    return await connection.select().from<ServiceInfo>(SERVICE_TABLE);
} 