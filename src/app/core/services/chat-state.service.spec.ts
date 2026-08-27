import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChatStateService } from './chat-state.service';
import { HrRagApiService } from './hr-rag-api.service';

describe('ChatStateService', () => {
  let service: ChatStateService;
  let apiServiceSpy: jasmine.SpyObj<HrRagApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HrRagApiService', ['askQuestion', 'checkHealth']);
    spy.checkHealth.and.returnValue(of({ message: 'Online' }));

    TestBed.configureTestingModule({
      providers: [
        ChatStateService,
        { provide: HrRagApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ChatStateService);
    apiServiceSpy = TestBed.inject(HrRagApiService) as jasmine.SpyObj<HrRagApiService>;
  });

  it('should be created and have initial welcome message', () => {
    expect(service).toBeTruthy();
    expect(service.messages().length).toBeGreaterThan(0);
    expect(service.messages()[0].sender).toBe('assistant');
  });

  it('should clear conversation history on clearHistory()', () => {
    service.clearHistory();
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].id).toBe('welcome-msg-reset');
  });
});
