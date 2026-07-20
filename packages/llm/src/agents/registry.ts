/**
 * Agent Registry - Central registry for all autonomous agents
 * Similar to LangChain AgentExecutor
 */

export { BaseAgent, AgentConfig, AgentMessage, AgentResult } from './base.js';

export const AGENT_REGISTRY = {
  // Commercial agents
  'sales-agent': {
    id: 'sales-agent',
    name: 'LandMap Sales Agent',
    role: 'AI Sales Assistant',
    description: 'Assists with lead qualification, property recommendations, and sales processes',
    tools: ['search_properties', 'get_region_data', 'calculate_score'],
    model: 'gpt-4',
    temperature: 0.7,
  },
  'support-agent': {
    id: 'support-agent',
    name: 'LandMap Support Agent',
    role: 'Customer Support Specialist',
    description: 'Handles user questions, onboarding, and platform guidance',
    tools: ['search_docs', 'get_help_topics', 'escalate_to_human'],
    model: 'gpt-4',
    temperature: 0.5,
  },
  'analyst-agent': {
    id: 'analyst-agent',
    name: 'LandMap Analyst Agent',
    role: 'Market Analyst',
    description: 'Analyzes market trends, property values, and provides insights',
    tools: ['get_market_data', 'analyze_trends', 'compare_regions'],
    model: 'gpt-4',
    temperature: 0.3,
  },
  // Automation agents
  'rag-agent': {
    id: 'rag-agent',
    name: 'LandMap RAG Agent',
    role: 'Document Intelligence',
    description: 'Answers questions using RAG from property docs, regulations, and market data',
    tools: ['query_documents', 'get_citations', 'summarize_doc'],
    model: 'gpt-4',
    temperature: 0.4,
  },
  'ops-agent': {
    id: 'ops-agent',
    name: 'LandMap Ops Agent',
    role: 'Operations Assistant',
    description: 'Handles internal operations, data maintenance, and system monitoring',
    tools: ['check_system_health', 'sync_data', 'generate_report'],
    model: 'gpt-4',
    temperature: 0.2,
  },
} as const;

export type AgentId = keyof typeof AGENT_REGISTRY;
