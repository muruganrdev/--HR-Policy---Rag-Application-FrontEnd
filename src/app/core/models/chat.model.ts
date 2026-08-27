export interface PolicySource {
  source: string;
  chunk: number;
}

export interface QuestionRequest {
  question: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: PolicySource[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  sources?: PolicySource[];
  isError?: boolean;
  isLoading?: boolean;
}

export interface BackendHealthStatus {
  status: 'online' | 'offline' | 'checking';
  message?: string;
  endpoint?: string;
  timestamp?: Date;
}
