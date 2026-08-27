export interface PolicyCategory {
  id: string;
  name: string;
  icon: string;
}

export interface SampleQuestion {
  category: string;
  label: string;
  query: string;
  icon: string;
}

export interface PolicyDocumentMeta {
  filename: string;
  title: string;
  category: string;
  version: string;
  description: string;
  keyHighlights: string[];
}
