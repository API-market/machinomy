/// <reference types="nedb" />
import Datastore = require('nedb');
export default interface Engine {
    connect(): Promise<any>;
    isConnected(): boolean;
    close(): Promise<any>;
    drop(): Promise<any>;
    exec(cb: Function): Promise<any>;
}
export declare class EngineMongo implements Engine {
    connectionInProgress: Promise<any>;
    _client: any;
    connect(): Promise<any>;
    isConnected(): boolean;
    close(): Promise<any>;
    drop(): Promise<any>;
    exec(cb: Function): any;
    ensureConnection(): Promise<void>;
}
export declare class EngineNedb implements Engine {
    datastore: Datastore;
    constructor(path: string, inMemoryOnly?: boolean);
    isConnected(): boolean;
    connect(): Promise<any>;
    close(): Promise<any>;
    drop(): Promise<any>;
    exec(cb: Function): Promise<any>;
}
export declare class EnginePostgres implements Engine {
    connectionInProgress: Promise<any>;
    _client: any;
    connect(): Promise<any>;
    isConnected(): boolean;
    close(): Promise<any>;
    drop(): Promise<any>;
    exec(cb: Function): Promise<any>;
    ensureConnection(): Promise<void>;
}
