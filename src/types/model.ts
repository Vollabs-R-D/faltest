export interface AIModel {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt: Date;
  status: 'training' | 'completed' | 'failed';
  requestId?: string;
  trainingLogs?: string[];
}

export interface ModelFormData {
  name: string;
  description: string;
  images: string[];
}