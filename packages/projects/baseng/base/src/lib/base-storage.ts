import { Subject } from 'rxjs';

// Singleton service for local and session storage (i.e. accessing browser Web Storage API).

export class BaseStorage {
  
    private constructor(type: string = 'LOCAL', id: string = 'basestorage') {
        this._type = type;
        this._id = id;
    }

    private _id: string = 'basestorage';
    private _type: string = 'LOCAL';
    private _fallbackStorage: any = {}; // angular in-memory fallback storage

    private static _singleton: BaseStorage;

    private _storage: any = {};

    static getInstance(type: string = 'LOCAL', id: string = 'basestorage'): BaseStorage {
        return BaseStorage._singleton || (BaseStorage._singleton = new BaseStorage(type, id))
    }

    private get index(): string {
        return this._id + '_' + 'storage';
    }

    public get storage(): any {
        if(this._type == 'LOCAL') {
            if(window.localStorage) {
            this._storage = window.localStorage;
            }
        }
        else if(this._type == 'SESSION') {
            if(window.sessionStorage) {
            this._storage = window.sessionStorage;
            }
        }

        return this._storage;
    }

    public get type(): string {
        return this._type;
    }

    public get session(): any {
        return window.sessionStorage || this._fallbackStorage;
    }

    public get local(): any {
        return window.localStorage || this._fallbackStorage;
    }
}