// list.component.ts
import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/app-state.service';
import { ListItemComponent } from '../../components/list-item/list-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ListItemComponent, CommonModule],
  template: `
    <div class="viewport">
      <div  class="spacer"></div>
        <app-list-item  *ngFor="let stateItem of appState" [stateItem]="stateItem"></app-list-item>
    </div>
  `,
  styles: [`
  .viewport {
    width: 100%;
    overflow: auto;
    position: relative;
  }
  .spacer {
    height:20px;
  }
  `]
})
export class ListComponent implements OnInit {
  appState: Array<{ name: string, value: string | number }> = [{ name: 'hello', value: 'world' }];

  constructor(private StateService: StateService) {
    this.StateService.stateChange$.subscribe((state) => {
      const arrayState = [];
      for (const [key, value] of Object.entries(state)) {
        arrayState.push({ name: key, value: JSON.stringify(value) });
      }
      this.appState = arrayState;
      console.log("State viewer, appState: ", arrayState);
    })
  }

  ngOnInit() {

  }
}