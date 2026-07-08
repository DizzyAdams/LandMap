export const TWENTY_PIPELINE_STAGES = ['captured', 'contacted', 'qualified', 'scheduled', 'closed_won', 'closed_lost'] as const;

export type PipelineStage = (typeof TWENTY_PIPELINE_STAGES)[number];

export type TwentyPerson = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TwentyLead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TwentyOpportunity = {
  id: string;
  title: string;
  stage: PipelineStage;
  amount?: number;
  currency?: string;
  personId?: string;
  leadId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TwentyNote = {
  id: string;
  title?: string;
  body: string;
  targetId?: string;
  targetType?: 'person' | 'lead' | 'opportunity';
};

export type TwentyConfig = {
  baseUrl: string;
  apiKey: string;
};
