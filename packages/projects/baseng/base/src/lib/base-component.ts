import { Component, OnInit, OnDestroy, AfterContentInit, AfterViewInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { BaseEventHub } from './base-event-hub';
import { BaseAppState } from './base-app-state';
import { User } from './model';
import { TestBed } from '@angular/core/testing';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

    _window: any = window; // window object
    _document: any = document; // document object
    _environment: any = {}; // environment settings

    _hammer: any; // for swipe support
    _basejs: any; // basejs library; base app support

    _followRedirects: boolean = true;
    _debugMode: boolean = false;
    _logLevel: string = 'verbose';

    _context: any; // tbd; component context data
    _appState: BaseAppState;
    _eventHub: BaseEventHub; // global event hub service

    _activeUser: any;

    _httpOptions: any = { headers: new HttpHeaders( { 'Accept':'*/*', 'Content-Type':'application/json' } ) };
    _sessionId: string = '_session_';

    constructor(
    ) {
        this._appState = BaseAppState.getInstance();
        this._eventHub = BaseEventHub.getInstance();
    }

    ngOnInit(): void {
        try {
            this._activeUser = this._appState.userContext;
        } catch (error) {
            console.error('Error parsing user data from storage', error);
            this._activeUser = {};
        }

        if(this._canDebug()) {
            console.debug('BaseComponent: ngOnInit - activeUser:');
            console.debug(this._activeUser);
        }
    }

    ngAfterContentInit(): void {
    }

    ngAfterViewInit(): void {
        this._window = window;
        this._hammer = window.eval('Hammer');
        this._basejs = window.eval('basejs');
    }

    ngOnDestroy(): void {
    }

    init(): void {
    }

    initView(): void {
    }

    refresh(): void {
    }

    public get window(): any {
        return this._window;
    }

    public get hammer(): any {
        return this._hammer;
    }

    public get baseJs(): any {
        return this._basejs;
    }

    public get environment(): any {
        return this._environment;
    }

    public get context(): any {
        return this._context;
    }

    public get appState(): BaseAppState {
        return this._appState;
    }

    public get storage(): any {
        return this._appState.state.storage;  // this can be either localStorage or sessionStorage based on initialization
    }

    public get activeAccount(): User {
        return this._appState.userContext;
    }

    public get activeUser(): User {
        return this._appState.userContext;
    }

    public updateUser(user: User = this.activeUser): void {
        this._appState.userContext = user;
    }

    public get userName(): string {
        return this.activeUser ? this.activeUser.username : '';
    }

    public get userDisplayName(): string {
        return this.activeUser ? this.activeUser.displayName : '';
    }

    public get isAuthenticated(): boolean {
        // console.debug('app.component(604): authenticated: msal: getActiveAccount()');
        // console.debug(this.msalService.instance.getActiveAccount());
        // this.activeAccount = this.msalService.instance.getActiveAccount();
        return this.activeUser ? this.activeUser.isAuthenticated : false;
    }

    public get displayName(): string {
        return this.activeUser ? this.activeUser.displayName : '';
    }

    public get accessToken(): string {
        return this.activeUser ? this.activeUser.accessToken : '';
    }

    public get sessionId(): string {
        return this._sessionId;
    }

    public get httpOptions(): any {
        this._initHttpOptions();
        return this._httpOptions;
    }

    public getHttpOptions(): any {
        return this._initHttpOptions();
    }

    isInUserGroup(groups: string[]): boolean {
        return (this.activeUser?.groups.find(g => g == (groups.find(passed_g => passed_g == g))) ? true : false);
    }

    public get eventHub(): BaseEventHub {
        return this._eventHub;
    }

    protected _canDebug(mode: string = 'debug'): boolean {
        return this._debugMode && (this._logLevel === 'verbose' || this._logLevel === mode);
    }

    protected _initHttpOptions(): any {

        if(this._canDebug()) {
            console.debug('BaseComponent: Initializing HTTP options.');
            console.debug('BaseComponent: AccessToken: ' + this.accessToken);
            console.debug('BaseComponent: SessionID: ' + this._sessionId);
        }

        this._httpOptions = { headers: new HttpHeaders({ 
            'Accept':'*/*', 
            'Content-Type':'application/json', 
            'X-SessionID': this.sessionId, 
            'Authorization': 'Bearer ' + this.accessToken } 
        )};

        //this._options = { headers: new HttpHeaders( { 'Accept':'*/*', 'Content-Type':'application/json' } ) };

        let language = this.storage['language'];

        if(language && language != '') {
            this._httpOptions.headers = this._httpOptions.headers.set('Accept-Language', language);
            this._httpOptions.headers = this._httpOptions.headers.set('Content-Language', language);
        }

        if(this._canDebug()) {
            console.debug('BaseComponent: HTTP options initialized:');
            console.debug(this._httpOptions);
        }
        
        return this._httpOptions;
    }

}