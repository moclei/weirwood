import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StateService } from './services/app-state.service';
import { ListComponent } from './features/state-viewer/state-viewer.component';
import { CardsButtonComponent } from './components/cards-button/cards-button.component';
import { CardViewerComponent } from './features/card-viewer/card-viewer.component';
import { TabMenuComponent } from './components/tab-menu/tab-menu.component';
import { CommonModule } from '@angular/common';
import { InstanceViewerComponent } from './features/instance-viewer/instance-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ListComponent, CardsButtonComponent, CardViewerComponent, TabMenuComponent, InstanceViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weirwood';
  connectedNum = 0;
  openInstances = 0;
  selectedComponent: string = 'app-card-viewer';

  onTabSelected(component: string) {
    this.selectedComponent = component;
  }

  constructor(private StateService: StateService) {
    this.StateService.stateChange$.subscribe((state) => {
      console.log("App component, state: ", state);
      if (state.stats) {
        this.connectedNum = state.stats.active;
        this.openInstances = state.stats.open;
      }
    })
  }
}
