import type { TwentyConfig, TwentyPerson, TwentyLead, TwentyOpportunity, TwentyNote, PipelineStage } from './types';

export class TwentyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: TwentyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Twenty API error ${res.status} on ${path}: ${text || res.statusText}`);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json() as Promise<T>;
    }
    return res.text() as unknown as Promise<T>;
  }

  // People

  async listPeople() {
    return this.request<{ data: { people: TwentyPerson[] } }>('/people');
  }

  async createPerson(input: Omit<TwentyPerson, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<{ data: { person: TwentyPerson } }>('/people', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getPerson(id: string) {
    return this.request<{ data: { person: TwentyPerson } }>(`/people/${id}`);
  }

  // Leads

  async listLeads() {
    return this.request<{ data: { leads: TwentyLead[] } }>('/leads');
  }

  async createLead(input: Omit<TwentyLead, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<{ data: { lead: TwentyLead } }>('/leads', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateLead(id: string, input: Partial<TwentyLead>) {
    return this.request<{ data: { lead: TwentyLead } }>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  // Opportunities

  async listOpportunities(filters?: { stage?: PipelineStage; personId?: string; leadId?: string }) {
    const qs = new URLSearchParams();
    if (filters?.stage) qs.set('stage', filters.stage);
    if (filters?.personId) qs.set('personId', filters.personId);
    if (filters?.leadId) qs.set('leadId', filters.leadId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<{ data: { opportunities: TwentyOpportunity[] } }>(`/opportunities${suffix}`);
  }

  async createOpportunity(input: Omit<TwentyOpportunity, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<{ data: { opportunity: TwentyOpportunity } }>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateOpportunity(id: string, input: Partial<TwentyOpportunity>) {
    return this.request<{ data: { opportunity: TwentyOpportunity } }>(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  // Notes

  async listNotes() {
    return this.request<{ data: { notes: TwentyNote[] } }>('/notes');
  }

  async createNote(input: Omit<TwentyNote, 'id'>) {
    return this.request<{ data: { note: TwentyNote } }>('/notes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Scoring

  async scoreLead(coordinates: {
    city?: string;
    state?: string;
    propertyType?: string;
    budget?: number;
  }): Promise<{ score: number; reason: string }> {
    let score = 50;
    const reasons: string[] = [];

    if (coordinates.city) {
      score += 15;
      reasons.push(`city match (${coordinates.city})`);
    }
    if (coordinates.state) {
      score += 10;
      reasons.push(`state match (${coordinates.state})`);
    }
    if (coordinates.propertyType) {
      score += 15;
      reasons.push(`property type match (${coordinates.propertyType})`);
    }
    if (coordinates.budget && coordinates.budget > 100000) {
      score += 10;
      reasons.push(`budget > 100k (${coordinates.budget})`);
    }
    if (coordinates.budget && coordinates.budget > 500000) {
      score += 10;
      reasons.push(`budget > 500k (${coordinates.budget})`);
    }

    score = Math.min(100, Math.max(0, score));

    return { score, reason: reasons.join('; ') || 'no scoring data' };
  }

  async bulkImport(
    input: Array<Omit<TwentyPerson, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const person of input) {
      try {
        await this.createPerson(person);
        created++;
      } catch (e) {
        errors.push(`Failed to create ${person.name}: ${(e as Error).message}`);
      }
    }

    return { created, errors };
  }
}
