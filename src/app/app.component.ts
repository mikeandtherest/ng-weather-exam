import { Component } from '@angular/core';
import { setGlobalCacheDuration } from './cache.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor() {
      setGlobalCacheDuration(120); // 120 seconds
    }
}
