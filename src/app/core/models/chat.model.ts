export interface PolicySource {
  source: string;
  chunk: number;
}

export interface QuestionRequest {
  question: string;
  conversation_id: string;
  role?: string;
  employee_id?: string;
  employee_name?: string;
}

export interface AskResponse {
  question?: string;
  answer: string;
  sources?: PolicySource[];
  route?: 'rag' | 'agent' | string;
  tools_used?: string[];
  conversation_id?: string;
  session_id?: string;
  memory_id?: string;
  agent_info?: Record<string, unknown>;
  previous_messages?: unknown[];
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sources?: PolicySource[];
  isError?: boolean;
  isLoading?: boolean;
  route?: 'rag' | 'agent' | string;
  toolsUsed?: string[];
  roleContextLabel?: string;
  role?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatStateSnapshot {
  version: number;
  activeConversationId: string | null;
  conversations: ChatConversation[];
  savedAt: string;
}

export interface BackendHealthStatus {
  status: 'online' | 'offline' | 'checking';
  message?: string;
  endpoint?: string;
  timestamp?: Date | string;
}
