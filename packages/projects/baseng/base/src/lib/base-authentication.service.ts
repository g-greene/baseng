import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '@baseng/base';

import { User } from './model';
import { userDefault } from './model/_default';


@Injectable({ providedIn: 'root' })
export class BaseAuthenticationService extends BaseComponent {

    private _onLoginSubject$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    protected onLogin: Observable<User | null> = this._onLoginSubject$.asObservable();

    private _onLoginSuccessSubject$: BehaviorSubject<User | any | null> = new BehaviorSubject<User | any | null>(null);
    protected onLoginSuccess: Observable<User | any | null> = this._onLoginSuccessSubject$.asObservable();

    private _onLoginFailedSubject$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    protected onLoginFailed: Observable<any | null> = this._onLoginFailedSubject$.asObservable();
    
    private _onLogoutSubject$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    protected onLogout: Observable<any | null> = this._onLogoutSubject$.asObservable();

    private _onLogoutSuccessSubject$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    protected onLogoutSuccess: Observable<any | null> = this._onLogoutSuccessSubject$.asObservable();

    private _onLogoutFailedSubject$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    protected onLogoutFailed: Observable<any | null> = this._onLogoutFailedSubject$.asObservable();

    _loginUrl: string = '';

    constructor(
        private http: HttpClient
    ) {
        super();
    }

    public get loginUrl(): string {
        return this._loginUrl;
    }

    public set loginUrl(value: string) {
        this._loginUrl = value;
    }

    public get userContext() {
        return this.appState.userContext ?? userDefault;
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this._onLoginSubject$.complete();
        this._onLoginSuccessSubject$.complete();
        this._onLoginFailedSubject$.complete();
        this._onLogoutSubject$.complete();
        this._onLogoutSuccessSubject$.complete();
        this._onLogoutFailedSubject$.complete();
    }

    login(username: string, password: string, sessionID: string) {
        var self = this;

        if(this._loginUrl == '') {
            throw new Error('BaseAuthenticationService: loginUrl is not set.');
        }

        let body: any = { 
            email: username, 
            password: password,
            sessionID: sessionID,
        };

        if(this._canDebug()) {
            console.debug('BaseAuthenticationService: login - url: ' + this.loginUrl);
            console.debug('BaseAuthenticationService: login - body:');
            console.debug(JSON.stringify(body));
        }

        return this.http.post<any>(this.loginUrl, body)
        .pipe(map(response => {
            var user_data: any = {},
                user: User = {
                userId: '',
                firstName: '',
                lastName: '',
                displayName: '',
                accessToken: '',
                username: '',
                groups: [],
                isAuthenticated: false
                };

                self._onLoginSubject$.next(response);

            // DEBUG
            // console.debug('auth');
            // console.debug(JSON.stringify(resp));

            // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
            // user.authdata = window.btoa(username + ':' + password);
            if(response.status == 200) {
                user = {
                    userId: response['userid'],
                    firstName: '',
                    lastName: '',
                    displayName: response['displayName'],
                    accessToken: response['authToken'],
                    username: username,
                    groups: [],
                    isAuthenticated: true
                };

                self._onLoginSuccessSubject$.next(response);

                // DEBUG
                // console.debug(JSON.stringify(user));

                this.appState.userContext = user;
            }
            else {
                this.appState.userContext = userDefault;
            }

            return response;
        }));
    }

    logout() {
        // remove user from local storage to log user out
        this.appState.userContext = userDefault;
        this._onLogoutSubject$.next(null);
        this._onLogoutSuccessSubject$.next(null);
    }
}
