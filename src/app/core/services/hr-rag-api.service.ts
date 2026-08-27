import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, catchError, retry } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constants';
import { AskResponse, QuestionRequest } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class HrRagApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONSTANTS.BASE_URL;

  /**
   * Sends a user question to the HR Policy RAG backend.
   * Endpoint: POST http://localhost:8001/ask
   */
  askQuestion(question: string): Observable<AskResponse> {
    const payload: QuestionRequest = { question: question.trim() };
    const url = `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.ASK}`;

    return this.http.post<AskResponse>(url, payload).pipe(
      timeout(API_CONSTANTS.DEFAULT_TIMEOUT_MS),
      retry(API_CONSTANTS.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Health check on root endpoint to verify FastAPI backend is running.
   * Endpoint: GET http://localhost:8001/
   */
  checkHealth(): Observable<{ message: string; docs?: string; endpoint?: string }> {
    const url = `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.ROOT}`;
    return this.http.get<{ message: string; docs?: string; endpoint?: string }>(url).pipe(
      timeout(5000),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'An unexpected error occurred while communicating with the HR Policy backend.';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the HR Policy FastAPI server (http://localhost:8001). Please ensure uvicorn is running on port 8001.';
      } else if (error.status === 422) {
        errorMessage = 'Invalid question format submitted to API.';
      } else if (error.status >= 500) {
        errorMessage = `HR Backend Server Error (${error.status}): Please check backend logs or Ollama status.`;
      } else {
        errorMessage = `Error (${error.status}): ${error.message}`;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Request timed out waiting for Ollama/Llama 3 response. Please verify your system load.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
