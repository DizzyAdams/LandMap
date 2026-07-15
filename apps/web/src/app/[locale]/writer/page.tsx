'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, Sparkles, PenLine } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Input, Button, Segmented } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Tone = 'professional' | 'warm' | 'investor';

const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Profissional' },
  { value: 'warm', label: 'Acolhedor' },
  { value: 'investor', label: 'Investidor' },
];

const TEMPLATES: Record<Tone, (city: string) => string> = {
  professional: (c) =>
    `Terreno premium em ${c}, com topografia plana e infraestrutura consolidada. Excelente para desarrollo residencial de alto padrão, com valorização consistente e liquidez comprovada.`,
  warm: (c) =>
    `Imagine construir seu próximo capítulo em ${c}. Um terreno onde cada metro quadrado convida à vida — luz, natureza e vizinhança que acolhem sua família.`,
  investor: (c) =>
    `Oportunidade de aquisição em ${c}: ROI projetado acima da média da região, baixo risco regulatório e demanda aquecida. Posição ideal para carteira diversificada.`,
};

export default function WriterPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [city, setCity] = useState('São Paulo');
  const [tone, setTone] = useState<Tone>('professional');
  const [output, setOutput] = useState('');

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/assistant')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <PenLine className="h-3 w-3" />
          Redator IA
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Descrições que vendem</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Gere textos de anúncio otimizados a partir de uma cidade e um tom.
        </p>
      </div>

      <Card className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-muted-foreground">Cidade</span>
          <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
        </label>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Tom</p>
          <div className="mt-2">
            <Segmented aria-label="Tom" options={TONES} value={tone} onChange={setTone} />
          </div>
        </div>
        <Button
          onClick={() => setOutput(TEMPLATES[tone](city || 'sua cidade'))}
          className="w-full"
        >
          <Sparkles className="h-4 w-4" />
          Gerar descrição
        </Button>
      </Card>

      <Reveal className="mt-6">
        {output && (
          <Card variant="highlight">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="font-semibold">Rascunho gerado</p>
              <Badge variant="info">IA</Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{output}</p>
          </Card>
        )}
      </Reveal>
    </main>
  );
}
