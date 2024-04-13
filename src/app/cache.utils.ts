import { CacheEntry } from './cache.type';
import { MonoTypeOperatorFunction, of, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

// Note. I prefer to go with an utils file for this kind of functions,
// instead of an Injectable, because they are mostly pure functions
// which do not depend on any external service or state (beside
// the local cacheDuration config variable)

let cacheDuration = 60 * 60 * 2; // 2 hours in seconds, by default

// this is an rxjs custom operator, which is meant to be used in a pipe
export function getWithCache<T>(key: string): MonoTypeOperatorFunction<T> {
  return pipe(
    (source) => {
      const cachedData = retrieveFromCache(key) as T;
      if (cachedData) {
        console.log('data taken from cache', key, cachedData)
        return of(cachedData);
      }

      console.log('data taken from server', key)
      return source.pipe(
        tap(data => storeInCache(key, data))
      )
    }
  );
}

function retrieveFromCache(key: string): any {
  const cacheEntryStr = localStorage.getItem(key);
  if (!cacheEntryStr) {
    return null;
  }

  const cacheEntry: CacheEntry = JSON.parse(cacheEntryStr);
  if (Date.now() - cacheEntry.timestamp > cacheDuration * 1000) {
    // cache expired so we remove it
    console.log('cache hit, but expired', key)
    localStorage.removeItem(key);
    return null;
  }

  console.log('cache hit and valid', key)
  return cacheEntry.data;
}

function storeInCache(key: string, data: any) {
  const cacheEntry: CacheEntry = {
    timestamp: Date.now(),
    data: data
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
}

// Note. I'm currently calling this function from AppComponent's constructor.
// However, maybe a better place would be either in the main.ts file or in the
// factory of the APP_INITIALIZER provider in the AppModule.
export function setGlobalCacheDuration(duration: number) {
  cacheDuration = duration;
}
