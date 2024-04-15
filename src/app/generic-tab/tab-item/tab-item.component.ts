import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.css']
})
export class TabItemComponent {
  // here I'm exposing the ng-template to the parent component
  @ViewChild(TemplateRef, { static: true }) template: TemplateRef<unknown>;

  @Input({ required: true }) label: string;
  @Input() data: string; // optional data to pass to the tab
  @Input() closed = false;
}
