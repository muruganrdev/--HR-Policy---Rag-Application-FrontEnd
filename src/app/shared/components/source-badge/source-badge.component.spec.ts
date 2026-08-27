import { TestBed } from '@angular/core/testing';
import { SourceBadgeComponent } from './source-badge.component';

describe('SourceBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceBadgeComponent]
    }).compileComponents();
  });

  it('should create and format document source name', () => {
    const fixture = TestBed.createComponent(SourceBadgeComponent);
    const component = fixture.componentInstance;
    component.source = { source: 'leave_policy.pdf', chunk: 3 };
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.getCleanFilename('leave_policy.pdf')).toBe('leave policy');
  });
});
