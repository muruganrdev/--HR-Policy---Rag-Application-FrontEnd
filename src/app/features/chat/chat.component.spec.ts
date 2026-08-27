import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create the chat component', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
