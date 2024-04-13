import {Injectable, Signal, signal} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { getWithCache } from './cache.utils';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  static readonly URL = 'https://api.openweathermap.org/data/2.5';
  static readonly APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static readonly ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';

  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(
    private http: HttpClient,
    private locationService: LocationService,
  ) {
    // no need to unsubscribe from this subscription, as Angular
    // will complete the underlying ReplaySubject and destroy the
    // effect registration when the service is destroyed
    toObservable(this.locationService.getLocations()).subscribe(
      (locations) => {
        const currentConditions = this.currentConditions();
        // add any new locations to the current conditions
        for (let loc of locations) {
          if (!currentConditions.some((cc) => cc.zip === loc)) {
            this.addCurrentConditions(loc);
          }
        }

        // remove any locations that are no longer in the list
        // Note. iterating backwards is intentional to avoid
        // index shifting when removing elements
        for (let i = currentConditions.length - 1; i >= 0; i--) {
          if (!locations.includes(currentConditions[i].zip)) {
            this.removeCurrentConditions(currentConditions[i].zip);
          }
        }
      }
    );
  }

  addCurrentConditions(zipcode: string): void {
    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    const url = `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`;
    this.http.get<CurrentConditions>(url).pipe(getWithCache(url))
      .subscribe(data => this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]));
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    const url = `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`;
    return this.http.get<Forecast>(url).pipe(
      getWithCache(url)
    );

  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
