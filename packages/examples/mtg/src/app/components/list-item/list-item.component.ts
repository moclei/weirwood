import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-item',
  standalone: true,
  template: `
    <div class="list-item">
      <p><b>{{ stateItem.name }}</b>: {{ stateItem.value }}</p>
    </div>
  `,
  styles: [`
    .list-item {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 8px;
      padding: 8px;
      overflow: hidden;
    }
  `]
})
export class ListItemComponent {
  @Input() stateItem: any = { name: '', value: '' };
}