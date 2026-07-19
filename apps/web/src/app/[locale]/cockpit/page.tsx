'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { RequireAuth } from '../../../components/RequireAuth';
import { Card, Badge, buttonVariants, cn } from '@landmap/ui';
import { Activity } from '../../../components/lovable/icons';

type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  runs: number;
  successRate: number;
}

export default function CockpitPage() {
  const locale = useLocale();

  const [agents, setAgents] = useState<AgentInfo[]>([
    { id: 'sales-agent', name: 'LandMap Sales Agent', role: 'AI Sales', description: 'Lead qualification', status: 'idle', runs: 1247, successRate: 94.2 },
    { id: 'support-agent', name: 'LandMap Support Agent', role: 'Support', description: 'Help desk', status: 'idle', runs: 892, successRate: 97.8 },
    { id: 'rag-agent', name: 'LandMap RAG Agent', role: 'Docs', description: 'RAG answers', status: 'idle', runs: 2341, successRate: 96.3 },
    { id: 'ops-agent', name: 'LandMap Ops Agent', role: 'Ops', description: 'System monitoring', status: 'idle', runs: 445, successRate: 99.1 },
  ]);

  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-500';
      case 'running':
        return 'bg-blue-500 animate-pulse';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRunAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'running' } : agent,
      ),
    );

    setTimeout(() => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                status: 'completed',
                runs: agent.runs + 1,
                successRate: Number(((agent.successRate * agent.runs + 100) / (agent.runs + 1)).toFixed(1)),
              }
            : agent,
        ),
      );
    }, 2000);
  };

  return (
    <RequireAuth>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col bg-background px-4 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
              <Activity className="h-4 w-4" />
              Cockpit
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Agentes Autônomos</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Time de agentes inteligentes com RAG + LangChain
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              {agents.filter((a) => a.status === 'running').length} ativos
            </Badge>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Total de Agentes</p>
            <p className="text-2xl font-bold">{agents.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Execuções Totais</p>
            <p className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.runs, 0).toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Taxa de Sucesso Média</p>
            <p className="text-2xl font-bold">{(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length).toFixed(1)}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Uptime</p>
            <p className="text-2xl font-bold text-green-600">99.9%</p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={cn(
                'cursor-pointer p-4 transition-all',
                selectedAgent?.id === agent.id && 'ring-2 ring-[var(--primary)]',
              )}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full', getStatusColor(agent.status))} />
                <h3 className="font-semibold">{agent.name}</h3>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{agent.role}</p>
              <p className="mt-2 text-sm text-foreground/70">{agent.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <span>{agent.runs.toLocaleString()} execuções</span>
                <span>{agent.successRate}% sucesso</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRunAgent(agent.id);
                }}
                className={cn(buttonVariants({ size: 'sm' }), 'mt-3 w-full')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Executar agente
              </button>
            </Card>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}