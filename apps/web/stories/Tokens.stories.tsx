import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: { layout: 'padded' },
};
export default meta;

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `var(${cssVar})`,
          border: '1px solid var(--border)',
        }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cssVar}</div>
      </div>
    </div>
  );
}

export const BrandColors: StoryObj = {
  name: 'Cores de marca',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      <Swatch name="emerald (#34d399)" cssVar="--emerald" />
      <Swatch name="emerald-bright" cssVar="--emerald-bright" />
      <Swatch name="cyan" cssVar="--cyan" />
      <Swatch name="violet" cssVar="--violet" />
      <Swatch name="gold" cssVar="--gold" />
      <Swatch name="gold-soft" cssVar="--gold-soft" />
    </div>
  ),
};

export const Surfaces: StoryObj = {
  name: 'Superfícies',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      <Swatch name="surface-1" cssVar="--surface-1" />
      <Swatch name="surface-2" cssVar="--surface-2" />
      <Swatch name="surface-3" cssVar="--surface-3" />
      <Swatch name="surface-4" cssVar="--surface-4" />
    </div>
  ),
};

export const Tints: StoryObj = {
  name: 'Tints (baixa-opacidade)',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      <Swatch name="emerald-tint" cssVar="--emerald-tint" />
      <Swatch name="cyan-tint" cssVar="--cyan-tint" />
      <Swatch name="gold-tint" cssVar="--gold-tint" />
      <Swatch name="violet-tint" cssVar="--violet-tint" />
    </div>
  ),
};

export const TextRamp: StoryObj = {
  name: 'Texto (AA)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: 'var(--text-strong)', fontSize: 28, fontWeight: 600 }}>
        Display / Strong
      </div>
      <div style={{ color: 'var(--text)', fontSize: 18 }}>Texto base</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        Texto muted (AA-safe #c9c9c9)
      </div>
      <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>
        Texto faint (caption)
      </div>
    </div>
  ),
};
