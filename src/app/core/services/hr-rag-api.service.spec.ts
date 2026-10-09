// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HrRagApiService } from './hr-rag-api.service';
import { API_CONSTANTS } from '../constants/api.constants';

describe('HrRagApiService', () => {
  let service: HrRagApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        HrRagApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HrRagApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST question to /ask endpoint', () => {
    const dummyResponse = {
      question: 'What is leave policy?',
      answer: '20 days annual leave',
      sources: [{ source: 'leave_policy.pdf', chunk: 1 }]
    };

    service.askQuestion('What is leave policy?', 'chat-123').subscribe(res => {
      expect(res.answer).toBe('20 days annual leave');
      expect(res.sources?.length).toBe(1);
    });

    const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/ask`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      question: 'What is leave policy?',
      conversation_id: 'chat-123'
    });
    req.flush(dummyResponse);
  });
});
