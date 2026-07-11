import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  Card,
  Badge,
  Input,
  Stat,
  Progress,
  Segmented,
  Tabs,
} from '@landmap/ui';

const meta: Meta = {
  title: 'Components',
  parameters: { layout: 'padded' },
};
export default meta;

export const Buttons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="gold">Gold</Button>
      <Button variant="hero">Hero</Button>
    </div>
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Card className="max-w-xs p-5">
        <h3 style={{ fontWeight: 600 }}>Card padrão</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          Superfície em camadas com hairline e elevação contida.
        </p>
      </Card>
      <Card variant="elevated" className="max-w-xs p-5">
        <h3 style={{ fontWeight: 600 }}>Card elevado</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          Versão com sombra mais pronunciada.
        </p>
      </Card>
    </div>
  ),
};

export const Badges: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge>tokens</Badge>
      <Badge variant="accent">accent</Badge>
      <Badge variant="success">sucesso</Badge>
      <Badge variant="warning">aviso</Badge>
      <Badge variant="danger">erro</Badge>
    </div>
  ),
};

export const Inputs: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Input placeholder="Placeholder padrão" />
      <Input placeholder="Com label" aria-label="Exemplo" />
    </div>
  ),
};

export const Stats: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Stat label="Imóveis" value="1.500" />
      <Stat label="Cidades" value="10" />
      <Stat label="Variação" value="+12,4%" trend="up" />
    </div>
  ),
};

export const ProgressBars: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <Progress value={35} />
      <Progress value={70} barClassName="bg-gradient-to-r from-emerald-400 to-cyan-400" />
    </div>
  ),
};

export const SegmentedControl: StoryObj = {
  render: () => (
    <Segmented
      options={[
        { label: 'Venda', value: 'venda' },
        { label: 'Aluguel', value: 'aluguel' },
        { label: 'Lançamento', value: 'lancamento' },
      ]}
      value="venda"
      onChange={() => {}}
    />
  ),
};

export const TabsControl: StoryObj = {
  render: () => (
    <Tabs
      items={[
        { label: 'Visão geral', value: 'geral' },
        { label: 'Dados', value: 'dados' },
        { label: 'Histórico', value: 'historico' },
      ]}
      value="geral"
      onChange={() => {}}
    />
  ),
};
