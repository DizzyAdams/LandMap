/**
 * Example Specialized Agent - Sales Agent
 * Extends BaseAgent with sales-specific logic
 */

import { BaseAgent, AgentConfig, AgentResult } from './base.js';
import { getTool, AGENT_TOOLS } from './tools.js';

export class SalesAgent extends BaseAgent {
  constructor() {
    super({
      id: 'sales-agent',
      name: 'LandMap Sales Agent',
      role: 'AI Sales Assistant',
      description: 'Assists with lead qualification, property recommendations, and sales processes',
      tools: ['search_properties', 'get_region_data', 'calculate_score'],
      model: 'gpt-4',
      temperature: 0.7,
    });
  }

  async execute(input: string, context?: any): Promise<AgentResult> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];

    // Simple agent logic - in production, use LangChain chain
    let response = '';
    const lowerInput = input.toLowerCase();

    // Detect intent and use tools
    if (lowerInput.includes('propriedade') || lowerInput.includes('im�vel') || lowerInput.includes('terreno')) {
      const tool = getTool('search_properties');
      if (tool) {
        const result = await tool({ query: input });
        toolsUsed.push('search_properties');
        response = `Encontrei op��es de propriedades para voc�. ${JSON.stringify(result.data)}`;
      }
    } else if (lowerInput.includes('regi�o') || lowerInput.includes('bairro') || lowerInput.includes('valor')) {
      const tool = getTool('get_region_data');
      if (tool) {
        const result = await tool({ regionId: 'default' });
        toolsUsed.push('get_region_data');
        response = `Aqui est�o os dados da regi�o. ${JSON.stringify(result.data)}`;
      }
    } else {
      response = `Ol�! Sou o assistente de vendas do LandMap. Posso ajud�-lo a encontrar propriedades, analisar regi�es ou calcular scores. Como posso ajudar?`;
    }

    const latency = Date.now() - startTime;

    return {
      agentId: this.id,
      response,
      toolsUsed,
      confidence: 0.85,
      latency,
    };
  }
}
