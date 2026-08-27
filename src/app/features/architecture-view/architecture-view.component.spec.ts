import { TestBed } from '@angular/core/testing';
import { ArchitectureViewComponent } from './architecture-view.component';

describe('ArchitectureViewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchitectureViewComponent]
    }).compileComponents();
  });

  it('should create the architecture component', () => {
    const fixture = TestBed.createComponent(ArchitectureViewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.pipelineSteps.length).toBe(6);
  });
});
