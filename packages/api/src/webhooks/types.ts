export const WEBHOOK_EVENTS = [
  'property.created',
  'property.updated',
  'property.deleted',
  'lead.created',
  'lead.updated',
  'alert.fired',
  'rag.query',
  'score.updated',
  'favorite.added',
  'ping',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
  lastDeliveryAt?: string;
  lastStatus?: number;
};

export type WebhookDelivery = {
  id: string;
  endpointId: string;
  event: WebhookEvent;
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  createdAt: string;
  durationMs: number;
};

export type WebhookEnvelope = {
  id: string;
  type: WebhookEvent;
  createdAt: string;
  data: Record<string, unknown>;
};
