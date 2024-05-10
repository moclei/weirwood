import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";


interface Tab {
  label: string;
  component: string;
  active: boolean;
}


@Component({
  selector: 'app-tab-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss']
})
export class TabMenuComponent {
  @Output() tabSelected = new EventEmitter<string>();

  tabs: Tab[] = [
    { label: 'Cards', component: 'app-card-viewer', active: true },
    { label: 'State', component: 'app-state-viewer', active: false },
    { label: 'Instances', component: 'app-instance-viewer', active: false }
  ];

  selectTab(selectedTab: Tab) {
    this.tabs.forEach(tab => {
      tab.active = tab === selectedTab;
    });
    this.tabSelected.emit(selectedTab.component);
  }
}