/**
 * Base Agent class for autonomous agents
 * Uses LangChain concepts: tools, memory, prompts
 */

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  model?: string;
  temperature?: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentResult {
  agentId: string;
  response: string;
  toolsUsed: string[];
  confidence: number;
  latency: number;
}

export abstract class BaseAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly role: string;
  public readonly description: string;
  protected tools: Map<string, any>;
  protected memory: AgentMessage[];
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.description = config.description;
    this.tools = new Map();
    this.memory = [];
    this.config = config;
  }

  abstract execute(input: string, context?: any): Promise<AgentResult>;

  protected addToMemory(message: AgentMessage): void {
    this.memory.push(message);
    // Keep last 50 messages
    if (this.memory.length > 50) {
      this.memory = this.memory.slice(-50);
    }
  }

  protected getMemory(): AgentMessage[] {
    return [...this.memory];
  }

  public clearMemory(): void {
    this.memory = [];
  }

  protected buildSystemPrompt(): string {
    return `You are ${this.name}, a ${this.role}.\n\n${this.description}\n\nYou have access to the following tools: ${Array.from(this.tools.keys()).join(', ')}.\n\nAlways be helpful, accurate, and concise. Use tools when needed.`;
  }
}
