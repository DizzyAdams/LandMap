'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  User,
  Building2,
  Plus,
  Trash2,
  Mail,
  Sparkles,
} from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { PlanGate } from '../../../components/PlanGate';
import { Card, Badge, Button, Stat, Avatar, Input } from '@landmap/ui';

type Role = 'owner' | 'admin' | 'member';

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const TEAM_KEY = 'landmap:team';
const WATCHLIST_KEY = 'landmap:shared_watchlist';
const MAX_SEATS = 5;

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function readTeam(): Member[] {
  try {
    const raw = window.localStorage.getItem(TEAM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Member[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  const seeded: Member[] = [
    { id: 'owner-1', name: 'Você', email: 'voce@landmap.ai', role: 'owner' },
  ];
  try {
    window.localStorage.setItem(TEAM_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

function readWatchlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function roleBadge(role: Role) {
  if (role === 'owner') return <Badge variant="default">Dono</Badge>;
  if (role === 'admin') return <Badge variant="info">Admin</Badge>;
  return <Badge variant="secondary">Membro</Badge>;
}

export default function TeamPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [members, setMembers] = useState<Member[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [region, setRegion] = useState('');

  useEffect(() => {
    setMembers(readTeam());
    setWatchlist(readWatchlist());
  }, []);

  function persistTeam(next: Member[]) {
    setMembers(next);
    try {
      window.localStorage.setItem(TEAM_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function addMember() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) return;
    if (members.length >= MAX_SEATS) return;
    const next: Member[] = [
      ...members,
      {
        id: `m-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role,
      },
    ];
    persistTeam(next);
    setName('');
    setEmail('');
    setRole('member');
  }

  function removeMember(id: string) {
    const target = members.find((m) => m.id === id);
    if (!target || target.role === 'owner') return;
    persistTeam(members.filter((m) => m.id !== id));
  }

  function persistWatchlist(next: string[]) {
    setWatchlist(next);
    try {
      window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function addRegion() {
    const trimmed = region.trim();
    if (!trimmed) return;
    if (watchlist.includes(trimmed)) {
      setRegion('');
      return;
    }
    persistWatchlist([...watchlist, trimmed]);
    setRegion('');
  }

  function removeRegion(value: string) {
    persistWatchlist(watchlist.filter((r) => r !== value));
  }

  const usedSeats = members.length;
  const pendingInvites = members.filter(
    (m) => (m as Member & { status?: string }).status === 'pending',
  ).length;
  const seatsFull = usedSeats >= MAX_SEATS;

  return (
    <PlanGate required="business">
      <ProductPageShell
        backHref="/plans"
        eyebrow={
          <>
            <Sparkles className="h-3 w-3" /> Equipe
          </>
        }
        title="Gerenciar equipe"
        description="Convide até 5 membros para colaborar em análises e compartilhar uma watchlist de regiões em comum."
        maxWidth="5xl"
      >
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Assentos usados" value={`${usedSeats} / ${MAX_SEATS}`} />
          <Stat label="Convites pendentes" value={pendingInvites} />
          <Stat label="Disponíveis" value={Math.max(0, MAX_SEATS - usedSeats)} />
        </section>

        {/* Members */}
        <Card className="mt-6 flex flex-col p-5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="font-display text-lg font-semibold">Membros</h2>
            <Badge variant="outline" className="ml-auto">
              {usedSeats}/{MAX_SEATS}
            </Badge>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <Avatar name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">
                    {m.name}
                  </p>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {m.email}
                  </p>
                </div>
                {roleBadge(m.role)}
                <button
                  type="button"
                  aria-label={`Remover ${m.name}`}
                  disabled={m.role === 'owner'}
                  onClick={() => removeMember(m.id)}
                  className="grid h-8 w-8 place-items-center rounded-md text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--destructive)] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {/* Invite form */}
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-[var(--border)] p-3 sm:flex-row sm:items-end">
            <Input
              label="Nome"
              placeholder="Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={seatsFull}
              className="flex-1"
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="maria@imobiliaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={seatsFull}
              className="flex-1"
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Função
              </span>
              <select
                value={role}
                disabled={seatsFull}
                onChange={(e) => setRole(e.target.value as Role)}
                className="flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Membro</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Button
              variant="default"
              onClick={addMember}
              disabled={seatsFull || !name.trim() || !email.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              Convidar membro
            </Button>
          </div>
          {seatsFull && (
            <p className="mt-2 text-xs text-[var(--warning)]">
              Limite de {MAX_SEATS} assentos atingido. Faça upgrade para adicionar mais
              membros.
            </p>
          )}
        </Card>

        {/* Shared watchlist */}
        <Card className="mt-4 flex flex-col p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="font-display text-lg font-semibold">Watchlist compartilhada</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Regiões de interesse visíveis para toda a equipe.
          </p>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addRegion();
            }}
          >
            <div className="flex-1">
              <Input
                label="Adicionar região"
                placeholder="Ex.: Vila Madalena, SP"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="mt-auto"
              disabled={!region.trim()}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </form>

          {watchlist.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Mail className="h-4 w-4" />
              Nenhuma região na watchlist ainda.
            </p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {watchlist.map((r) => (
                <li key={r}>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1 pl-2.5 pr-1"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${r}`}
                      onClick={() => removeRegion(r)}
                      className="grid h-5 w-5 place-items-center rounded-sm text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--destructive)] motion-reduce:transition-none"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </ProductPageShell>
    </PlanGate>
  );
}
