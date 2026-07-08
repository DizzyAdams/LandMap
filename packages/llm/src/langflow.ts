import { chatCompletion } from './completion.js';

/* ------------------------------------------------------------------ */
/*  LangFlow-like workflow engine                                     */
/* ------------------------------------------------------------------ */

export type StepInput = Record<string, unknown>;

export interface Step {
  id: string;
  type: 'llm' | 'tool' | 'chain' | 'condition';
  run(input: StepInput): Promise<StepInput>;
}

export interface Workflow {
  id: string;
  name: string;
  steps: Step[];
}

export interface WorkflowRunResult {
  workflowId: string;
  status: 'ok' | 'error';
  result?: StepInput;
  error?: string;
  steps: Array<{ id: string; status: 'ok' | 'error'; output?: unknown }>;
  durationMs: number;
}

/* ---- Built-in steps ---- */

export class LLMStep implements Step {
  id: string;
  type = 'llm' as const;

  constructor(
    id: string,
    private prompt: string,
    private model = 'openai/gpt-4o-mini',
  ) {
    this.id = id;
  }

  async run(input: StepInput): Promise<StepInput> {
    const messages = [
      { role: 'system' as const, content: this.prompt },
      ...((input.messages as Array<{ role: 'user' | 'system' | 'assistant'; content: string }> | undefined) ??
        []),
    ];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { content } = await chatCompletion(messages, this.model);
    return { ...input, output: content };
  }
}

export class ToolStep implements Step {
  id: string;
  type = 'tool' as const;
  result: unknown;

  constructor(
    id: string,
    private fn: (input: StepInput) => Promise<unknown> | unknown,
  ) {
    this.id = id;
  }

  async run(input: StepInput): Promise<StepInput> {
    this.result = await this.fn(input);
    return { ...input, output: this.result };
  }
}

export class ConditionalStep implements Step {
  id: string;
  type = 'condition' as const;

  constructor(
    id: string,
    private cond: (input: StepInput) => boolean,
    private consequent: Step,
    private fallback?: Step,
  ) {
    this.id = id;
  }

  async run(input: StepInput): Promise<StepInput> {
    if (this.cond(input)) {
      return this.consequent.run(input);
    }
    if (this.fallback) {
      return this.fallback.run(input);
    }
    return input;
  }
}

/* ---- Runner ---- */

export async function runWorkflow(workflow: Workflow, initial: StepInput = {}): Promise<WorkflowRunResult> {
  const started = Date.now();
  const stepsLog: WorkflowRunResult['steps'] = [];
  let current: StepInput = initial;

  try {
    for (const step of workflow.steps) {
      current = await step.run(current);
      stepsLog.push({ id: step.id, status: 'ok', output: current.output });
    }

    return {
      workflowId: workflow.id,
      status: 'ok',
      result: current,
      steps: stepsLog,
      durationMs: Date.now() - started,
    };
  } catch (error) {
    return {
      workflowId: workflow.id,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown workflow error',
      steps: stepsLog,
      durationMs: Date.now() - started,
    };
  }
}
