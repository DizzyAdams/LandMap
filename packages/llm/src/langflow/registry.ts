import {
  LLMStep,
  ToolStep,
  ConditionalStep,
  runWorkflow,
  type Step,
  type StepInput,
  type Workflow,
  type WorkflowRunResult,
} from '../langflow.js';
import { chatCompletion } from '../completion.js';
import type { LlmMessage } from '../types.js';
import { CopywriterAgent, type PropertyForCopy } from '../agents/CopywriterAgent.js';
import { LeadScorerAgent, type LeadProfile } from '../agents/LeadScorerAgent.js';
import { ingestDocuments, type Chunk } from '../rag.js';

/* ------------------------------------------------------------------ */
/*  Public types                                                      */
/* ------------------------------------------------------------------ */

export type WorkflowCategory = 'report' | 'lead' | 'copy' | 'rag';

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  inputSchema: Record<string, string>;
};

/**
 * An LLM step that never throws: if the model call fails (missing key,
 * network error, etc.) it falls back to a deterministic, on-brand string so
 * the workflow always completes and the deployed app stays alive.
 */
class SafeLLMStep implements Step {
  id: string;
  type = 'llm' as const;

  constructor(
    id: string,
    private system: string,
    private buildUser: (input: StepInput) => string,
    private fallback: (input: StepInput) => string,
    private model = 'openai/gpt-4o-mini',
  ) {
    this.id = id;
  }

  async run(input: StepInput): Promise<StepInput> {
    const messages: LlmMessage[] = [
      { role: 'system', content: this.system },
      { role: 'user', content: this.buildUser(input) },
    ];
    try {
      const { content } = await chatCompletion(messages, this.model);
      return { ...input, output: content };
    } catch {
      return { ...input, output: this.fallback(input) };
    }
  }
}

function chunks(): Chunk[] {
  return ingestDocuments().map((chunk) => ({
    id: String(chunk.id ?? ''),
    text: String(chunk.text ?? ''),
    path: String(chunk.path ?? ''),
    title: String(chunk.title ?? ''),
    tokens: typeof chunk.tokens === 'number' ? chunk.tokens : Number(chunk.tokens ?? 0),
  }));
}

const marketReportWorkflow: Workflow = {
  id: 'market-report',
  name: 'Relatório de Mercado',
  steps: [
    new ToolStep('prepare', (input) => {
      const stats = (input.stats ?? {}) as Record<string, unknown>;
      const total = stats.total ?? 'n/d';
      const avg = stats.avgPrice ?? 'n/d';
      const cities = Array.isArray(stats.cities)
        ? (stats.cities as Array<{ city: string; state: string; count: number }>)
            .slice(0, 5)
            .map((c) => `${c.city}/${c.state} (${c.count})`)
            .join(', ')
        : 'n/d';
      return `Total: ${total} | Preço médio: ${avg} | Top cidades: ${cities}`;
    }),
    new SafeLLMStep(
      'narrative',
      'Você é um analista imobiliário sênior da LandMap. Escreva um relatório de mercado em português (pt-BR) com visão geral, oportunidades e recomendação.',
      (input) =>
        `Consulta: ${String(input.query ?? 'mercado geral')}\nResumo dos dados:\n${String(input.output ?? '')}`,
      (input) =>
        `[Relatório template] Mercado "${String(input.query ?? 'geral')}" com ${String(
          (input.stats as Record<string, unknown>)?.total ?? 'múltiplos',
        )} imóveis monitorados. Oportunidades concentram-se nas cidades de destaque. Recomendamos acompanhamento semanal via LandMap.`,
    ),
  ],
};

const leadEnrichWorkflow: Workflow = {
  id: 'lead-enrich',
  name: 'Enriquecimento de Lead',
  steps: [
    new ToolStep('score', (input) => {
      const lead = (input.lead ?? {}) as unknown as LeadProfile;
      const scorer = new LeadScorerAgent({ chunks: chunks() });
      const scored = scorer.score(lead);
      const segment =
        scored.score >= 75 ? 'quente' : scored.score >= 45 ? 'morno' : 'frio';
      return JSON.stringify({ score: scored.score, breakdown: scored.breakdown, segment });
    }),
    new SafeLLMStep(
      'enrich',
      'Você é um especialista em Inside Sales imobiliário. Gere 2 a 3 next-steps acionáveis para o lead abaixo, em português (pt-BR).',
      (input) => `Lead: ${JSON.stringify(input.lead ?? {})}\nScore: ${String(input.output ?? '')}`,
      (input) =>
        `Próximos passos para o lead (score ${String(input.output ?? 'n/d')}):\n1) Enviar apresentação do imóvel mais aderente.\n2) Agendar ligação de qualificação.\n3) Adicionar à sequência de follow-up semanal.`,
    ),
  ],
};

const propertyCopyWorkflow: Workflow = {
  id: 'property-copy',
  name: 'Copy de Imóvel',
  steps: [
    new ToolStep('copy', async (input) => {
      const property = (input.property ?? {}) as unknown as PropertyForCopy;
      const agent = new CopywriterAgent('standard');
      const result = await agent.generate(property);
      return JSON.stringify(result);
    }),
    new SafeLLMStep(
      'social',
      'Crie um post curto para Instagram/WhatsApp (pt-BR) com emoji, baseado na copy abaixo.',
      (input) => `Copy do imóvel:\n${String(input.output ?? '')}`,
      (input) => `🏠 Oportunidade LandMap!\n${String(input.output ?? 'Imóvel em destaque').slice(0, 180)}\n#imobiliario #landmap`,
    ),
  ],
};

const WORKFLOWS: Workflow[] = [
  marketReportWorkflow,
  leadEnrichWorkflow,
  propertyCopyWorkflow,
];

const DEFINITIONS: Record<string, WorkflowDefinition> = {
  'market-report': {
    id: 'market-report',
    name: 'Relatório de Mercado',
    description: 'Gera um relatório narrativo de mercado a partir de KPIs/estatísticas.',
    category: 'report',
    inputSchema: { query: 'string', stats: 'object' },
  },
  'lead-enrich': {
    id: 'lead-enrich',
    name: 'Enriquecimento de Lead',
    description: 'Pontua e enriquece um lead com next-steps de vendas.',
    category: 'lead',
    inputSchema: { lead: 'object' },
  },
  'property-copy': {
    id: 'property-copy',
    name: 'Copy de Imóvel',
    description: 'Gera headline, descrição, bullets e post social para um imóvel.',
    category: 'copy',
    inputSchema: { property: 'object' },
  },
};

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export function listWorkflows(): WorkflowDefinition[] {
  return Object.values(DEFINITIONS);
}

export function getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
  return DEFINITIONS[id];
}

export function runWorkflowById(
  id: string,
  initial: StepInput = {},
): Promise<WorkflowRunResult> {
  const workflow = WORKFLOWS.find((w) => w.id === id);
  if (!workflow) {
    return Promise.resolve({
      workflowId: id,
      status: 'error',
      error: `Workflow "${id}" not found`,
      steps: [],
      durationMs: 0,
    });
  }
  return runWorkflow(workflow, initial);
}

export { ConditionalStep, LLMStep, ToolStep };

