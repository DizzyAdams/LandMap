'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { unstable_setRequestLocale } from 'next-intl/server';

/* ------------------------------------------------------------------ *
 * LandMap — Surreal Launch Presentation
 * Indigo mono-dark, on-brand (var(--primary) / --background / --ring).
 * Framer Motion 11. Scroll-driven parallax, morphing gradient orbs,
 * kinetic logo bloom, magnetic text reveal, staggered feature cards.
 * Fully neutralized under prefers-reduced-motion.
 * ------------------------------------------------------------------ */

const COL = {
  primary: 'var(--primary)',
  ring: 'var(--ring)',
  muted: 'var(--muted-foreground)',
};

const FEATURES = [
  { k: 'Mapa de valorização', d: 'Ranking de regiões A–F com heat API em tempo real.' },
  { k: 'Histórico de preço /m²', d: 'Séries de 20 cidades, investor-grade.' },
  { k: 'Dossier de região', d: 'Demografia, ROI e liquidez num toque.' },
  { k: 'RAG + Chat', d: 'Pergunte à inteligência do terreno.' },
  { k: 'Agentes autônomos', d: 'Follow-up, cold recovery e WABA em auto-loop.' },
  { k: 'Multi-idioma', d: 'pt-BR · en-US · es-ES nativo.' },
];

export default function LaunchPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  // Parallax layers
  const orbY1 = useTransform(smooth, [0, 1], [0, -260]);
  const orbY2 = useTransform(smooth, [0, 1], [0, 180]);
  const orbScale = useTransform(smooth, [0, 0.5, 1], [1, 1.6, 0.8]);
  const heroY = useTransform(smooth, [0, 0.4], [0, -120]);
  const heroOpacity = useTransform(smooth, [0, 0.35], [1, 0]);
  const gridOpacity = useTransform(smooth, [0, 0.6], [0.18, 0.02]);

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Fixed surreal backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: 620,
            height: 620,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--primary) 70%, transparent), transparent 70%)',
            filter: 'blur(80px)',
            y: reduce ? 0 : orbY1,
            scale: reduce ? 1 : orbScale,
            opacity: 0.55,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-25%',
            right: '-15%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--ring) 60%, transparent), transparent 70%)',
            filter: 'blur(90px)',
            y: reduce ? 0 : orbY2,
            opacity: 0.45,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: reduce ? 0.1 : 1,
            // @ts-expect-error -- framer style
            '--grid-op': gridOpacity,
            maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 80%)',
          }}
        />
      </div>

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <motion.div
          style={{ y: reduce ? 0 : heroY, opacity: reduce ? 1 : heroOpacity }}
        >
          <RevealWord reduce={reduce} text="LANDMAP" size={84} />
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{
              marginTop: 18,
              color: COL.muted,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontSize: 13,
              fontFamily: 'var(--font-display)',
            }}
          >
            Inteligência de terrenos
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.9, type: 'spring', stiffness: 120 }}
            style={{ marginTop: 40, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Pill>pt-BR</Pill>
            <Pill>en-US</Pill>
            <Pill>es-ES</Pill>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            style={{ marginTop: 64, color: COL.muted, fontSize: 13 }}
          >
            role ↓ para revelar
          </motion.div>
        </motion.div>
      </section>

      {/* SURREAL MORPH BLOCK */}
      <section style={sectionStyle}>
        <OrbMorph reduce={reduce} />
        <RevealText reduce={reduce} delay={0.1}>
          O mapa que pensa
          <br />
          como um investidor.
        </RevealText>
        <RevealText reduce={reduce} delay={0.35} sub>
          Cada região ganha vida — gradientes que respiram, dados que flutuam.
        </RevealText>
      </section>

      {/* FEATURES — staggered magnetic cards */}
      <section style={{ ...sectionStyle, minHeight: 'auto', padding: '120px 24px' }}>
        <RevealText reduce={reduce} delay={0}>
          Tudo num só lugar
        </RevealText>
        <div
          style={{
            marginTop: 56,
            maxWidth: 980,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.k} reduce={reduce} index={i} title={f.k} desc={f.d} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...sectionStyle, minHeight: '70vh' }}>
        <RevealText reduce={reduce} delay={0}>
          Pronto para lançar.
        </RevealText>
        <motion.a
          href="/pt-BR/map"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          whileHover={reduce ? undefined : { scale: 1.06 }}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          style={{
            marginTop: 40,
            display: 'inline-block',
            padding: '16px 38px',
            borderRadius: 999,
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 0 40px color-mix(in srgb, var(--primary) 50%, transparent)',
          }}
        >
          Abrir o mapa →
        </motion.a>
      </section>

      <footer
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '40px 24px 64px',
          color: COL.muted,
          fontSize: 12,
          letterSpacing: '0.1em',
        }}
      >
        LandMap · lançamento 2026
      </footer>
    </div>
  );
}

/* ---------- pieces ---------- */

function RevealWord({ reduce, text, size }: { reduce: boolean; text: string; size: number }) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(180deg, var(--foreground), color-mix(in srgb, var(--primary) 80%, var(--foreground)))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {text.split('').map((c, i) => (
        <motion.span
          key={i}
          initial={reduce ? false : { opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.7, type: 'spring', stiffness: 140 }}
          style={{ display: 'inline-block', transformOrigin: 'bottom' }}
        >
          {c}
        </motion.span>
      ))}
    </h1>
  );
}

function RevealText({
  reduce,
  delay,
  sub,
  children,
}: {
  reduce: boolean;
  delay: number;
  sub?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ delay, duration: 0.9 }}
      style={{
        fontFamily: sub ? 'var(--font-sans)' : 'var(--font-display)',
        fontSize: sub ? 18 : 44,
        fontWeight: sub ? 400 : 600,
        lineHeight: 1.15,
        color: sub ? 'var(--muted-foreground)' : 'var(--foreground)',
        maxWidth: 760,
        textAlign: 'center',
      }}
    >
      {children}
    </motion.div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '8px 18px',
        borderRadius: 999,
        border: '1px solid color-mix(in srgb, var(--ring) 50%, transparent)',
        fontSize: 13,
        fontFamily: 'var(--font-display)',
        color: 'var(--foreground)',
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
      }}
    >
      {children}
    </span>
  );
}

function OrbMorph({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { scale: 0, rotate: -180, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, type: 'spring', stiffness: 60 }}
      style={{
        width: 260,
        height: 260,
        borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%',
        background:
          'conic-gradient(from 0deg, color-mix(in srgb, var(--primary) 90%, transparent), color-mix(in srgb, var(--ring) 90%, transparent), color-mix(in srgb, var(--primary) 90%, transparent))',
        filter: 'blur(6px)',
        marginBottom: 48,
        boxShadow: '0 0 90px color-mix(in srgb, var(--primary) 55%, transparent)',
        animate: reduce
          ? undefined
          : {
              borderRadius: [
                '42% 58% 63% 37% / 41% 44% 56% 59%',
                '63% 37% 41% 59% / 58% 63% 37% 42%',
                '42% 58% 63% 37% / 41% 44% 56% 59%',
              ],
            },
        // @ts-expect-error -- framer style
        transition: reduce ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' },
      }}
    />
  );
}

function FeatureCard({
  reduce,
  index,
  title,
  desc,
}: {
  reduce: boolean;
  index: number;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6 }}
      whileHover={reduce ? undefined : { y: -8, scale: 1.02 }}
      style={{
        position: 'relative',
        padding: 26,
        borderRadius: 18,
        border: '1px solid color-mix(in srgb, var(--ring) 30%, transparent)',
        background: 'color-mix(in srgb, var(--primary) 6%, var(--card, transparent))',
        backdropFilter: 'blur(8px)',
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 + index * 0.05, duration: 0.7 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: 'linear-gradient(90deg, var(--primary), transparent)',
          transformOrigin: 'left',
        }}
      />
      <h3
        style={{
          margin: '0 0 10px',
          fontFamily: 'var(--font-display)',
          fontSize: 19,
          fontWeight: 600,
          color: 'var(--foreground)',
        }}
      >
        {title}
      </h3>
      <p style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5 }}>
        {desc}
      </p>
    </motion.div>
  );
}

const sectionStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 24px',
  textAlign: 'center',
};
