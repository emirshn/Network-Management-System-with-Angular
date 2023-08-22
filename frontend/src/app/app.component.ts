import { Component } from '@angular/core';
import { TopologySimulationService } from './services/simulation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'auth-project';
  constructor(private simulationService: TopologySimulationService) {}
  ngOnInit(): void {
    this.simulationService.initializeSimulation();

    setTimeout(() => {
      localStorage.clear()
    }, 1000 * 1000); 
  }
}
