import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/app-state.service';
import { CommonModule } from '@angular/common';
import { InstanceBoxComponent } from '../../components/instance-box/instance-box.component';

@Component({
  selector: 'app-instance-viewer',
  standalone: true,
  imports: [CommonModule, InstanceBoxComponent],
  templateUrl: './instance-viewer.component.html',
  styleUrl: './instance-viewer.component.scss'
})

export class InstanceViewerComponent implements OnInit {
  instances: any[] = [];
  columns: any[][] = [];

  constructor(private stateService: StateService) {
    this.stateService.stateChange$.subscribe((state) => {
      this.instances = state.ports;
      console.log("InstanceViewerComponent, instances: ", this.instances);
    })
  }

  ngOnInit() {
    this.updateColumns();
  }

  updateColumns() {
    const columnCount = this.getColumnCount();
    this.columns = Array.from({ length: columnCount }, () => []);
    this.instances.forEach((instance, index) => {
      const columnIndex = index % columnCount;
      this.columns[columnIndex].push(instance);
    });
  }

  getColumnCount() {
    const instanceCount = this.instances.length;
    if (instanceCount <= 5) {
      return 1;
    } else if (instanceCount <= 10) {
      return 2;
    } else {
      return 3;
    }
  }
}