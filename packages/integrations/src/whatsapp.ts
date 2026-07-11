/**
 * WhatsApp Business Cloud API (WABA / Meta Graph API) client.
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * When `accessToken` / `phoneNumberId` are absent the client runs in
 * **mock mode** — every call resolves with a synthetic message id so the
 * integration can be wired and tested end-to-end before real credentials
 * are provided. This mirrors the existing `OpenDesignClient` convention.
 */
import type { WhatsAppConfig, WhatsAppMessage, WhatsAppSendResult } from './types.js';

const DEFAULT_API_VERSION = 'v21.0';
const DEFAULT_BASE_URL = 'https://graph.facebook.com';

export class WhatsAppClient {
  private readonly accessToken?: string;
  private readonly phoneNumberId?: string;
  private readonly businessAccountId?: string;
  private readonly webhookVerifyToken?: string;
  private readonly apiVersion: string;
  private readonly baseUrl: string;

  constructor(config: WhatsAppConfig = {}) {
    this.accessToken = config.accessToken ?? process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId =
      config.phoneNumberId ??
      process.env.WHATSAPP_PHONE_NUMBER_ID ??
      process.env.WHATSAPP_BUSINESS_PHONE_ID;
    this.businessAccountId = config.businessAccountId ?? process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.webhookVerifyToken = config.webhookVerifyToken ?? process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    this.apiVersion = config.apiVersion ?? DEFAULT_API_VERSION;
    this.baseUrl = (config.baseUrl ?? process.env.WHATSAPP_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  get mock(): boolean {
    return !this.configured;
  }

  /** GET webhook verification (Meta "subscribe" handshake). */
  verifyWebhook(params: { mode?: string; token?: string; challenge?: string }): string | null {
    const mode = params.mode ?? '';
    const token = params.token ?? '';
    const challenge = params.challenge ?? '';
    if (mode === 'subscribe' && this.webhookVerifyToken && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /** Parse an inbound webhook payload (already JSON-decoded) into messages. */
  parseWebhook(body: unknown): WhatsAppMessage[] {
    const b = body as { entry?: Array<{ changes?: Array<{ value?: { messages?: WhatsAppMessage[] } }> }> };
    const out: WhatsAppMessage[] = [];
    for (const entry of b.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const m of change.value?.messages ?? []) out.push(m);
      }
    }
    return out;
  }

  async sendText(to: string, text: string): Promise<WhatsAppSendResult> {
    return this.send({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    });
  }

  async sendTemplate(
    to: string,
    template: string,
    opts: { languageCode?: string; components?: unknown[] } = {},
  ): Promise<WhatsAppSendResult> {
    return this.send({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: opts.languageCode ?? 'pt_BR' },
        components: (opts.components as never[]) ?? [],
      },
    });
  }

  private async send(payload: Record<string, unknown>): Promise<WhatsAppSendResult> {
    if (!this.configured) {
      return {
        id: `mock-wamid.${Math.random().toString(36).slice(2, 12)}`,
        to: String(payload.to ?? ''),
        type: String(payload.type ?? 'text'),
        status: 'mock_sent',
        mock: true,
        generatedAt: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`WhatsApp API error ${res.status}: ${detail.slice(0, 200)}`);
    }

    const json = (await res.json()) as { messages?: Array<{ id: string }> };
    const id = json.messages?.[0]?.id ?? 'unknown';
    return {
      id,
      to: String(payload.to ?? ''),
      type: String(payload.type ?? 'text'),
      status: 'sent',
      mock: false,
      generatedAt: new Date().toISOString(),
    };
  }
}
