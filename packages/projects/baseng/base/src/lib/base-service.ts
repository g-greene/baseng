import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpEventType } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import querystring from 'querystring';

@Injectable()
export class BaseService {
  // base web service call methods with OData support.
  _versionName: string = 'api-version';
  _version: string = '2.0';

  _baseUrl: string = '/';
  _url: string = '{0}?api-version=2.0';
  _urlEntity: string = '{0}/{1}/?api-version=2.0';
  _urlRoute: string = '{0}/{1}/';

  _urlTypes: any = {};

  get versionName(): string {
    return this._versionName;
  }

  get version(): string {
    return this._version;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  set baseUrl(value: string) {
    this._baseUrl = value;
  }

  get url(): string {
    return this._url;
  }

  get http(): HttpClient {
    return this._http;
  }

  private _initUrlTypes(): string {
    this._urlTypes = {
      'odata': `${this._baseUrl}?{0}${this.versionName}=${this.version}`,
      'odata-entity': `${this._baseUrl}/{0}/{1}/?${this.versionName}=${this.version}`,
      'route': `${this._baseUrl}/{0}/{1}/`
    };

    return this._urlTypes;
  }

  private _buildOData(url: string, params: any): string {
    let op: ODataParams = new ODataParams(params);
    return url + (params ? op.toString() : '');
  }

  private _buildUrl(type: string, path: any, params: any = null): string {
    this._initUrlTypes();
    return this._buildOData(this._urlTypes[type]
      .replace('{0}', path.resource ? path.resource : '')
      .replace('{1}', path.entity ? path.entity : ''), params);
  }

  private _buildBody(record: any, options: any): any {
    let body: any = {},
    isFormPost = options && options['Content-Type'] && options['Content-Type'] == 'application/x-www-form-urlencoded' ? true : false;

    Object.assign(body, record);

    if(isFormPost) {
      let parts: any[] = [];
      record = BaseService.toRecord(record);
        Object.keys(record).forEach((key)=> {
          parts.push(key + '=' + encodeURIComponent(record[key]));
        });
        body = parts.join('&');
    }
    return body;
  }

  filterMap: any = {
    'app_id': 'ApplicationId',
    'application_id': 'ApplicationId',
    'company_id': 'CompanyId',
    'group_id': 'GroupId'
  };

  constructor(
    private _http: HttpClient
  ) {

  }

  static toRecord(data: any) {
    var r: any = null;
    if(data instanceof FormData) {
      data.forEach((value: FormDataEntryValue, key: string, parent: FormData) => {
        r[key] = value.toString();
      });
    }
    return r || data;
  }

  public requestOData(type: 'get' | 'post' | 'put' | 'patch' | 'delete', resource: string, entity: string = '', params: any = {}, record: any = {}, options: any = {}, callbackError: Function = (error: any) => {}) {
    let url: string = this._buildUrl(entity != '' ? 'odata-entity' : 'odata', { resource: resource, entity: entity });
    url = this._buildOData(url, params);
    // url = this.getCountString(params.count) + this.getFilterString(params.filter) + this.getExpandString(params.expand) + this.getOrderByString(params.orderby) + this.getTopString(params.top) + this.getQueryString(params.query);
    
    return this._request(type, url, entity, record, options, callbackError);
  }

  private _request(type: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, entity: string, record: any, options: any = {}, callbackError: Function = (error: any) => {}) : Observable<any> {
    let req: Observable<any>

    if(!('Content-Type' in options) && !('content-type' in options)) {
      options['Content-Type'] = 'application/json';
    }

    switch(type) {
      case 'get':
        req = this.http.get<any>(url, options);
        break;
      case 'post':
        req = this.http.post<any>(url, this._buildBody(record, options), options);
        break;
      case 'put':
        req = this.http.put<any>(url, record, options);
        break;
      case 'patch':
        req = this.http.patch<any>(url, record, options);
        break;
      case 'delete':
        req = this.http.delete<any>(url, options);
        break;
      default:
        throw new Error('Unsupported request type: ' + type);
    }

    let res = req.pipe(
      map((data: any) => {
          return data;
        }
      ),
       // catchError(() => of([]))
       catchError(
        (err: any, caught: Observable<any>): any => {
          if(callbackError) {
            callbackError(err);
          }
          else {
            alert(`Whoops, there was an error trying to ${type.toUpperCase()}:\n\n ${err.message}`);
          }
          // return caught;
          throw new Error(err.message);
        }
      ),
      // tap(
      //   data => console.log(data)
      // )
    );

    return res;
  }
}

export class ODataParams {
  _params: Map<'orderby' | 'top' | 'filter' | 'expand' | 'count' | 'query', any> = new Map<'orderby' | 'top' | 'filter' | 'expand' | 'count' | 'query', any>();
  _options: any = {};
  _interpolation: any = {
    'app_id': 'ApplicationId',
    'application_id': 'ApplicationId',
    'company_id': 'CompanyId',
    'group_id': 'GroupId'
  };

  constructor(params: any = {}, options: any = {}) {
    this._params = params;
    this._options = options;
  }

  private _first(paramType: 'orderby' | 'top' | 'filter' | 'expand' | 'count' | 'query'): string | number {
    this._params.get(paramType).forEach((value: any, key: string) => {
      if(key && value != '') {
        return value;
      }
    });
    return '';
  }

  private _all(paramType: 'orderby' | 'top' | 'filter' | 'expand' | 'count' | 'query'): string[] {
    var values: string[] = [];
    this._params.get(paramType).forEach((value: any, key: string) => {
      if(key && value != '') {
        values[values.length] = value;
      }
    });
    return values;
  }

  private _queryString(): string {
    let qs = querystring.stringify(this._params.entries() as any);
    return qs ? '&' + qs : '';
  }

  private _top(): string {
    let value: string | number= this._first('top');
    return (value != '' ? '&$top=' + value : '');
  }

  private _orderBy(preserveEmpty: boolean = false) {
    let parts: string[] = [];
    this._params.forEach((value: string, key: string) => {
      if(!value || value == '') {
        if(preserveEmpty) {
          this._params.get('orderby').set(key, 'asc');
        }
      }
      else {
         parts[parts.length] = key + ' ' + this._params.get('orderby').get(key);
      }
    });
    return (parts.length > 0 ? '&$orderby=' + parts.join(',') : '');
  }

  private _filter(preserveEmpty: boolean = false): string {
    var parts: string[] = [];

    if(!this._params) {
      return '';
    }

    for(var key in this._interpolation) {
      if(!this._params.get('filter').get(key) || this._params.get('filter').get(key) == '') {
        continue;
      }
      if(key in this._params) {
        parts[parts.length] = this._interpolation[key] + ' eq ' + this._params.get('filter').get(key) + '';
        this._params.get('filter').delete(key);
      }
    }

    for(var key in this._params) {
      if(!this._params.get('filter').get(key) || this._params.get('filter').get(key) == '') {
        continue;
      }
      let paramValue: string = this._params.get('filter').get(key),
      regEx: any = null;

      // console.debug('param:');
      // console.debug(paramValue);

      if(paramValue.startsWith('%') && paramValue.endsWith('%')) {
        parts[parts.length] = 'contains(' + key + ',\'' + paramValue.substring(1, paramValue.length - 1) + '\')';
      }
      else {
         if(!isNaN(Date.parse(this._params.get('filter').get(key) || ''))) {
          if(new RegExp('[sS]tart', 'gim').test(key)) {
            parts[parts.length] = key.replace(/[sS]tart/gim,'') + ' gt ' + this._params.get('filter').get(key) + '';
          }
          else if(new RegExp('[eE]nd', 'gim').test(key)) {
            parts[parts.length] = key.replace(/[eE]nd/gim,'') + ' lt ' + this._params.get('filter').get(key) + '';
          }
          else {
            parts[parts.length] = key + ' eq ' + this._params.get('filter').get(key) + '';
          }
        }
        else {
          parts[parts.length] = key + ' eq ' + this._params.get('filter').get(key) + '';
        }
      }
    }

    return (parts.length > 0 ? '&$filter=' + parts.join(' and ') : '');
  }

  private _expand(): string {
    var parts: string[] = this._all('expand');
    return (parts.length > 0 ? '&$expand=' + parts.join(',') : '');
  }

  private _count(): string {
    var parts: string[] = this._all('count');
    return (parts.length > 0 ? '&$count=' + parts.join(',') : '');
  }

  public toString(): string {
    return  this._count() + this._filter()+ this._expand() + this._top() + this._orderBy() + this._queryString();
  }
}
