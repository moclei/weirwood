import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { StateService } from '../../services/app-state.service';
import { Instance } from '../../../models/app.state';


@Component({
  selector: 'app-instance-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-box.component.html',
  styleUrl: './instance-box.component.scss'
})

export class InstanceBoxComponent {
  @Input() instance: Instance | null = null;

  constructor(private StateService: StateService) {
  }

  handleClick() {
    console.log('InstanceBoxComponent clicked');
    if (!this.instance) return;
    this.StateService.setInstanceState({ isOpen: !this.instance.isOpen }, this.instance.tabId);
  }
}