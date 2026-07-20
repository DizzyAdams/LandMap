/**
 * Agent Executor - Executes agents with LangChain-style orchestration
 * Integrates RAG, tools, and memory
 */

import { BaseAgent, type AgentConfig, type AgentMessage, type AgentResult } from './base.js';
import { AGENT_REGISTRY, type AgentId } from './registry.js';
import { AGENT_TOOLS, getTool, getAllTools } from './tools.js';
import { AgentMemory, type MemoryChunk } from './memory.js';

export { BaseAgent, type AgentConfig, type AgentMessage, type AgentResult } from './base.js';
export { AGENT_REGISTRY, type AgentId } from './registry.js';
export { AGENT_TOOLS, getTool, getAllTools } from './tools.js';
export { AgentMemory, type MemoryChunk } from './memory.js';

export interface ExecutionContext {
  agentId: string;
  input: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ExecutionResult extends AgentResult {
  context: ExecutionContext;
  memoryUsed: number;
}

export class AgentExecutor {
  private agents: Map<string, BaseAgent>;
  private memories: Map<string, AgentMemory>;

  constructor() {
    this.agents = new Map();
    this.memories = new Map();
  }

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    this.memories.set(agent.id, new AgentMemory());
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const agent = this.agents.get(context.agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${context.agentId}`);
    }

    const memory = this.memories.get(context.agentId)!;

    // Add user message to memory
    memory.add({
      content: context.input,
      timestamp: new Date(),
      metadata: { role: 'user', userId: context.userId, sessionId: context.sessionId },
    });

    try {
      // Execute agent
      const result = await agent.execute(context.input, {
        memory: memory.getRecent(10),
        metadata: context.metadata,
      });

      // Add assistant response to memory
      memory.add({
        content: result.response,
        timestamp: new Date(),
        metadata: { role: 'assistant', toolsUsed: result.toolsUsed },
      });

      const latency = Date.now() - startTime;

      return {
        ...result,
        context,
        memoryUsed: memory.getRecent().length,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        agentId: context.agentId,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        toolsUsed: [],
        confidence: 0,
        latency,
        context,
        memoryUsed: memory.getRecent().length,
      };
    }
  }

  getMemory(agentId: string): AgentMemory | undefined {
    return this.memories.get(agentId);
  }

  clearMemory(agentId: string): void {
    this.memories.get(agentId)?.clear();
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}
