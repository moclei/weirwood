import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { StateService } from '../../services/app-state.service';
import { DerivedInstanceState } from 'weirwood/dist/model/weirwood.model';
import { StateConfig } from '../../../web-ext/weirwood/config';


@Component({
  selector: 'app-instance-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-box.component.html',
  styleUrl: './instance-box.component.scss'
})

export class InstanceBoxComponent {
  @Input() instance: DerivedInstanceState<typeof StateConfig> | null = null;

  constructor(private state: StateService) {
  }

  handleClick() {
    console.log('InstanceBoxComponent clicked');
    if (!this.instance) return;
    // this.state.send({ isOpen: !this.instance.isOpen });
  }
}