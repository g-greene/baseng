import { BaseStorage } from './base-storage';

import { User } from './model';
import { userDefault } from './model/_default';

export class BaseAppState
{
    private _storage: BaseStorage;

    private constructor(storageId: string = "") {
        this._storage = BaseStorage.getInstance('LOCAL', storageId);

        this._storage.storage['_currentHostname'] = window.location.hostname;
        this._storage.storage['_currentHostPort'] = window.location.port;

        this._storage.storage['_userContext'] = this._storage.storage['_userContext'] || JSON.stringify(userDefault);

        this._storage.session['_activeStates'] = this._storage.session['_activeStates'] || {};
        this._storage.session['_astat'] = this._storage.session['_astat'] || {};
    }

    private static _singleton: BaseAppState;

    static getInstance(storageId: string = ""): BaseAppState {
        return BaseAppState._singleton || (BaseAppState._singleton = new BaseAppState(storageId));
    }

    get state(): BaseStorage {
        return this._storage;
    }

    get hostName(): string {
        return this._storage.storage['_currentHostname'];
    }

    get hostPort(): string {
        return this._storage.storage['_currentHostPort'];
    }

    get userContext(): User {
        return JSON.parse(this._storage.storage['_userContext']);
    }

    set userContext(value: User) {
        this._storage.storage['_userContext'] = JSON.stringify(value);
    }

    get breadCrumbOrigin(): string {
        return this._storage.session['breadcrumb-origin'];
    }

    set breadCrumbOrigin(value: string) {
        this._storage.session['breadcrumb-origin'] = value;
    }
}