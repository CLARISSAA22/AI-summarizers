
declare module 'pg' {
    import { events } from 'events';

    export class Pool extends events.EventEmitter {
        constructor(config?: PoolConfig);
        connect(): Promise<PoolClient>;
        connect(callback: (err: Error, client: PoolClient, done: (release?: any) => void) => void): void;
        query(queryStream: any): any;
        query(text: string, values?: any[]): Promise<QueryResult>;
        query(text: string, callback: (err: Error, result: QueryResult) => void): void;
        query(text: string, values: any[], callback: (err: Error, result: QueryResult) => void): void;
        end(callback?: () => void): Promise<void>;
    }

    export interface PoolConfig {
        connectionString?: string;
        ssl?: boolean | any;
        [key: string]: any;
    }

    export interface PoolClient {
        query(text: string, values?: any[]): Promise<QueryResult>;
        query(text: string): Promise<QueryResult>;
        release(err?: any): void;
    }

    export interface QueryResult {
        rows: any[];
        rowCount: number;
    }
}
