import { Injectable, signal } from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private locations = signal<string[]>([]);

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      this.locations.set(JSON.parse(locString));
    }
  }

  addLocation(zipcode : string) {
    this.locations.update(locations => [...locations, zipcode]);
    this.syncLocalStorage();
  }

  removeLocation(zipcode : string) {
    const locations = this.locations();
    const location = locations.find(loc => loc === zipcode);
    if (location) {
      this.locations.update(locations => locations.filter(loc => loc !== location));
      this.syncLocalStorage();
    }
  }

  getLocations() {
    return this.locations.asReadonly();
  }

  private syncLocalStorage() {
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
  }
}
