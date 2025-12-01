import { Subject } from 'rxjs';

export class BaseEventHub
{
    private static _singleton: BaseEventHub;
    private _events: Map<string, BaseEvent> = new Map<string, BaseEvent>();

    private constructor() {
    }

    static getInstance(): BaseEventHub {
        return BaseEventHub._singleton || (BaseEventHub._singleton = new BaseEventHub());
    }

    public init(): void {
    }

    // built-in event subjects

    private _userInitSource = new Subject<any>();
    userInitSource$ = this._userInitSource.asObservable();

    private _astatChanged = new Subject<any>();
    astatChanged$ = this._astatChanged.asObservable();

    private _userLoggedIn = new Subject<any>();
    userLoggedIn$ = this._userLoggedIn.asObservable();

    private _userLoggedOut = new Subject<any>();
    userLoggedOut$ = this._userLoggedOut.asObservable();

    private _routerEventChanged = new Subject<any>();
    routerEventChanged$ = this._routerEventChanged.asObservable();

    private _languageChanged = new Subject<any>();
    languageChanged$ = this._languageChanged.asObservable();

    private _devToolsConfigChanged = new Subject<any>();
    devToolsConfigChanged$ = this._devToolsConfigChanged.asObservable();

    private _findTyping = new Subject<any>();
    findTyping$ = this._findTyping.asObservable();

    private _findExecutedSource = new Subject<any>();
    findExecuted$ = this._findExecutedSource.asObservable();

    private _findResultsChangedSource = new Subject<any>();
    findResultsChanged$ = this._findResultsChangedSource.asObservable();

    // built-in events

    emitUserInit(event: any) {
        this._userInitSource.next(event);
    }

    emitUserLoggedIn(event: any) {
        this._userLoggedIn.next(event);
    }

    emitUserLoggedOut(event: any) {
        this._userLoggedOut.next(event);
    }

    emitAstatChanged(event: any) {
        this._astatChanged.next(event);
    }

    emitRouterEventChanged(event: any) {
        this._routerEventChanged.next(event);
    }

    emitLanguageChanged(event: any) {
        this._languageChanged.next(event);
    }

    emitDevToolsConfigChanged(event: any) {
        this._devToolsConfigChanged.next(event);
    }

    emitFindExecuted(event: any) {
        this._findExecutedSource.next(event);
    }

    emitFindTyping(event: any) {
        this._findTyping.next(event);
    }

    emitFindResultsChanged(event: any) {
        this._findResultsChangedSource.next(event);
    }

    public get(id: string): BaseEvent {
        return this._events.get(id)!;
    }

    public create(id: string): BaseEvent {
        if(this._events.has(id)) {
            return this._events.get(id)!;
        }

        let item = new BaseEvent(id);
        this._events.set(id, item);
        return item;
    }

    public has(id: string): boolean {
        return this._events.has(id);
    }

    public delete(id: string): void {
        if(this._events.has(id)) {
            this._events.get(id)?.subject.unsubscribe();
            this._events.delete(id);
        }
    }
}

export class BaseEvent {
    private _id: string = '';
    private _subject: Subject<any> = new Subject<any>();
    private _observable$ = this._subject.asObservable();
    private _emitter: Function = (data: any) => { 
        this._subject.next(data); 
    }

    public constructor(public eventId: string) {
        this._id = eventId;
    }

    public get id(): string {
        return this._id;
    }

    public get subject(): Subject<any> {
        return this._subject;
    }

    public get observable$() {
        return this._observable$;
    }

    public emit(data: any, ...args: any[]): void {
        this._emitter(data, ...args);
    }
}