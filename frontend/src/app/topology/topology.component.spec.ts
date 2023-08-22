import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyComponent } from './topology.component';

describe('TopologyComponent', () => {
  let component: TopologyComponent;
  let fixture: ComponentFixture<TopologyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopologyComponent]
    });
    fixture = TestBed.createComponent(TopologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
