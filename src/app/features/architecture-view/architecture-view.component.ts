import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-view.component.html',
  styleUrl: './architecture-view.component.scss'
})
export class ArchitectureViewComponent {
  readonly pipelineSteps = [
    {
      step: '1',
      title: 'User Question',
      tech: 'Frontend input',
      desc: 'The user submits a question in the assistant sidebar or chat panel.'
    },
    {
      step: '2',
      title: 'Question Preprocessing',
      tech: 'Prompt normalization',
      desc: 'The request is cleaned and prepared before routing.'
    },
    {
      step: '3',
      title: 'Query Rewriting',
      tech: 'Optional LLM step',
      desc: 'The backend may reformulate the request to improve targeting.'
    },
    {
      step: '4',
      title: 'Query Expansion',
      tech: 'Optional retrieval enhancement',
      desc: 'Related terms may be expanded to improve recall where needed.'
    },
    {
      step: '5',
      title: 'Route / Retrieval',
      tech: 'RAG or Agent',
      desc: 'The backend decides whether to resolve through retrieval or a tool-driven agent flow.'
    },
    {
      step: '6',
      title: 'RAG Retrieval',
      tech: 'Vector search',
      desc: 'When routed as RAG, relevant HR policy chunks are retrieved, ranked, and grounded.'
    },
    {
      step: '7',
      title: 'Agent Tool Selection',
      tech: 'Agent workflow',
      desc: 'When routed as Agent, it selects tools for employee, policy, and leave data lookup.'
    },
    {
      step: '8',
      title: 'Tool Execution / Observation',
      tech: 'Planner loop',
      desc: 'The agent may call tools and observe results until it reaches a stable answer.'
    },
    {
      step: '9',
      title: 'Final Answer',
      tech: 'Grounded response',
      desc: 'The backend returns the answer, route metadata, and any relevant sources or tools used.'
    }
  ];

  readonly comparisonMatrix = [
    { component: 'PDF Extraction', chosen: 'pypdf', alternative: 'PyMuPDF / pdfplumber', reason: 'Zero native C-dependencies, lightweight, fast text stream.' },
    { component: 'Chunking', chosen: 'Fixed-size sliding window (600 chars, 100 overlap)', alternative: 'Semantic chunking', reason: 'Fixed 600‑char windows with 100‑char overlap preserve context across chunk boundaries.' },
    { component: 'Embedding', chosen: 'all-MiniLM-L6-v2', alternative: 'OpenAI text-embedding-3', reason: '100% offline, zero API fees, high vector density (384-d).' },
    { component: 'Vector DB', chosen: 'ChromaDB', alternative: 'Pinecone / FAISS', reason: 'Embedded SQLite metadata, HNSW graph index, zero SaaS cost.' },
    { component: 'Query Preprocessing', chosen: 'Ollama + Llama 3', alternative: 'None', reason: 'Corrects spelling and grammar before retrieval.' },
    { component: 'Query Rewriting', chosen: 'Ollama + Llama 3', alternative: 'None', reason: 'Rephrases query for better semantic retrieval while preserving important terms; safety check 60% token overlap.' },
    { component: 'Query Expansion', chosen: 'Ollama + Llama 3', alternative: 'None', reason: 'Adds retrieval‑oriented keywords to improve recall; safety check 60% token overlap.' },
    { component: 'Distance Threshold Filtering', chosen: 'Threshold = 1.2', alternative: 'None', reason: 'Filters out chunks whose distance exceeds the configured threshold, tuned for recall.' },
    { component: 'Retrieval Reranking', chosen: 'cross-encoder/ms-marco-MiniLM-L-6-v2', alternative: 'None', reason: 'Reorders retrieved candidates using query‑document relevance scoring.' },
    { component: 'Grounded Generation', chosen: 'Ollama (Llama 3)', alternative: 'OpenAI GPT-4o API', reason: 'Generates answer grounded solely in retrieved HR‑policy context.' }
  ];
}
