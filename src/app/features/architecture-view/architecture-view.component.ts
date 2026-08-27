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
      title: 'Query Preprocessing',
      tech: 'Ollama + Llama 3',
      desc: 'Corrects spelling and grammar before retrieval.'
    },
    {
      step: '2',
      title: 'Query Rewriting',
      tech: 'Ollama + Llama 3',
      desc: 'Rephrases the question for better semantic retrieval while preserving important terms.'
    },
    {
      step: '3',
      title: 'Query Expansion',
      tech: 'Ollama + Llama 3',
      desc: 'Adds useful retrieval keywords to improve recall.'
    },
    {
      step: '4',
      title: 'Embedding',
      tech: 'all-MiniLM-L6-v2',
      desc: 'Converts text into numerical vectors for semantic search.'
    },
    {
      step: '5',
      title: 'ChromaDB Retrieval',
      tech: 'ChromaDB',
      desc: 'Searches semantically similar HR-policy chunks.'
    },
    {
      step: '6',
      title: 'Distance Threshold Filtering',
      tech: 'Threshold = 1.2',
      desc: 'Filters out chunks whose distance exceeds the configured threshold.'
    },
    {
      step: '7',
      title: 'CrossEncoder Reranking',
      tech: 'cross-encoder/ms-marco-MiniLM-L-6-v2',
      desc: 'Reorders retrieved candidates using query-document relevance scoring.'
    },
    {
      step: '8',
      title: 'Relevant Context',
      tech: 'Top N = 5 chunks',
      desc: 'Selected chunks passed to the LLM for generation.'
    },
    {
      step: '9',
      title: 'Llama 3 Generation',
      tech: 'Llama 3 via Ollama',
      desc: 'Generates answer grounded in the retrieved context.'
    },
    {
      step: '10',
      title: 'Grounded Answer + Sources',
      tech: '',
      desc: 'Final answer displayed with verified policy citations.'
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
