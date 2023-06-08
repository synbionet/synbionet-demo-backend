import Koa from 'koa';
import { Knex } from 'knex';
import json from 'koa-json';
import cors from '@koa/cors';
import { Server } from 'http';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { RouterContext } from 'koa-router';

import {
    connect,
    createDbTables,
    saveEvent,
    listExchanges,
    listServices
} from './db';
import { EventContainer } from "./types";

// here to make typing correct
declare module 'koa' {
    interface BaseContext {
        db: Knex;
    }
}

export default class BionetApp {
    private port: number;
    private app = new Koa();
    private router = new Router();
    private server: Server | undefined;

    constructor(port = 8081) {
        this.port = port;
    }

    async start() {
        this.app.context.db = connect();

        // setup db
        await createDbTables(this.app.context.db);

        // routes
        this.router.post("/event/save", async (ctx: RouterContext): Promise<void> => {
            const data = ctx.request.body as EventContainer;
            let ok = await saveEvent(ctx.db, data)
            if (ok) {
                ctx.status = 200;
                return;
            }

            // there was a problem
            ctx.status = 400;
            ctx.body = {
                reason: `problem saving event`
            };
        });

        this.router.get("/exchanges", async (ctx: RouterContext): Promise<void> => {
            let result = await listExchanges(ctx.db);
            ctx.status = 200;
            ctx.body = result;
        });

        this.router.get("/services", async (ctx: RouterContext): Promise<void> => {
            let result = await listServices(ctx.db);
            ctx.status = 200;
            ctx.body = result;
        });

        // middleware
        this.app.use(cors({ origin: '*' }));
        this.app.use(json());
        this.app.use(bodyParser({ jsonLimit: '15mb' }));
        this.app
            .use(this.router.routes())
            .use(this.router.allowedMethods());

        // fire it up!
        this.server = this.app.listen(this.port, () => {
            console.log(` ~ synbionet listening on port ${this.port} ~`);
        });
    }

    async stop() {
        this.app.context.db.destroy();
        this.server?.close();
    }
}

(async () => {
    const app = new BionetApp();
    await app.start();

    process.on('SIGINT', async () => {
        await app.stop()
    });
    process.on('SIGTERM', async () => {
        await app.stop()
    });
})();

