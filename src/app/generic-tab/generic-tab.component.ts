import { Component, ContentChildren, DestroyRef, EventEmitter, Output, QueryList, inject } from '@angular/core';
import { TabItemComponent } from './tab-item/tab-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-generic-tab',
  templateUrl: './generic-tab.component.html',
  styleUrls: ['./generic-tab.component.css']
})
export class GenericTabComponent {
  @ContentChildren(TabItemComponent) tabs: QueryList<TabItemComponent>;

  @Output() tabClose = new EventEmitter<string>();

  activeTab: TabItemComponent;

  // takeUntilDestroyed needs to be used either in
  // an injection context, or we need to manualy provide
  // the destroyRef instance
  private destroyRef = inject(DestroyRef);

  ngAfterContentInit() {
    if (this.tabs.length) {
      this.activeTab = this.tabs.first;
    } else {
      this.tabs.changes.pipe(
        debounceTime(50),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((list) => {
        if (!this.activeTab) {
          this.activeTab = list.first;
        } else {
          this.activeTab = list.last;
        }
      });
    }
  }

  selectTab(tab: TabItemComponent) {
    this.activeTab = tab;
  }

  closeTab(tab: TabItemComponent) {
    tab.closed = true;
    this.tabClose.emit(tab.data);
    if (this.activeTab === tab) {
      this.activeTab = this.tabs.toArray().find(t => !t.closed);
    }
  }
}
