import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PolicyExplorerComponent } from './policy-explorer.component';

describe('PolicyExplorerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyExplorerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the policy explorer component', () => {
    const fixture = TestBed.createComponent(PolicyExplorerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.catalog.length).toBe(6);
  });
});
