import { UserInfo } from "../models";
import { logger } from "./logger";

export class AuthenticationCache {

    private _entries: AuthenticationCacheEntry[] = [];

    get enabled(): boolean {
        return this._cacheExpirationS > 0;
    }

    constructor(private _cacheExpirationS: number) {
        if (this._cacheExpirationS < 0) {
            this._cacheExpirationS = 0;
        } 

        if (this._cacheExpirationS === 0) {
            logger.info('Authentication cache is disabled');
        } else {
            logger.info(`Authentication cache enabled with expiration of ${this._cacheExpirationS}s`);
        }
    }

    public addValidAuthentication(token: string, userInfo: UserInfo): void {
        // Remove existing entry
        this._entries = this._entries.filter((entry: AuthenticationCacheEntry) => entry.token !== token);

        // Create new entry
        const expirationDate = new Date(Date.now() + this._cacheExpirationS * 1000);
        this._entries.push(new ValidAuthenticationCacheEntry(token, expirationDate, userInfo));

        // Cleanup expired entries
        this.clean();
    }

    public addInvalidAuthentication(token: string, error: any): void {
        // Remove existing entry
        this._entries = this._entries.filter((entry: AuthenticationCacheEntry) => entry.token !== token);

        // Create new entry
        const expirationDate = new Date(Date.now() + this._cacheExpirationS * 1000);
        this._entries.push(new InvalidAuthenticationCacheEntry(token, expirationDate, error));

        // Cleanup expired entries
        this.clean();
    }

    public getAuthentication(token: string): AuthenticationCacheEntry {
        // Cleanup expired entries
        this.clean();

        // Return entry if it exists
        return this._entries.find((entry: AuthenticationCacheEntry) => entry.token === token);
    }

    public clean(): void {
        const previousSize = this._entries.length;
        this._entries = this._entries.filter((entry: AuthenticationCacheEntry) => entry.isExpired() === false);
        const currentSize = this._entries.length;

        if (currentSize !== previousSize) {
            logger.debug(`Deleted ${previousSize - currentSize} cache entries`);
        }
    }

}

export class AuthenticationCacheEntry {

    get token(): string {
        return this._token;
    }

    constructor(private _token: string, private _expirationDate: Date) {
    }

    public isExpired(): boolean {
        return this._expirationDate.getTime() < Date.now();
    }

    public getUserInfo(): UserInfo {
        throw new Error('Method not implemented');
    }
}

class ValidAuthenticationCacheEntry extends AuthenticationCacheEntry {
    constructor(token: string, expirationDate: Date, private _userInfo: UserInfo) {
        super(token, expirationDate);
    }

    public getUserInfo(): UserInfo {
        return this._userInfo;
    }   
}

class InvalidAuthenticationCacheEntry extends AuthenticationCacheEntry {
    constructor(token: string, expirationDate: Date, private _error: any) {
        super(token, expirationDate);
    }

    public getUserInfo(): UserInfo {
        throw this._error;
    }   
}