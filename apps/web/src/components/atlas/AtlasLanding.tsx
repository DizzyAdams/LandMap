'use client';

import Link from 'next/link';
import { formatBRL, formatM2 } from '../../lib/format';

export type AtlasPlot = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  type: string;
  modality: string;
};

/** Deterministic pseudo-survey coordinate so each plot reads like a datum. */
function datum(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const lat = 8 + (h % 2200) / 100;
  const lon = 34 + ((h >> 8) % 2000) / 100;
  return `${lat.toFixed(2)}\u00b0S \u00b7 ${lon.toFixed(2)}\u00b0W`;
}

const CSS_A = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,500&display=swap');
.atlas{--ink:#06070a;--ink2:#0a0d12;--paper:#eef2ef;--muted:#8a99a0;--line:#1b2830;
  --survey:#5fe3c0;--survey2:#43c7ee;--gold:#d8b25a;
  position:relative;min-height:100dvh;background:var(--ink);color:var(--paper);
  font-family:'Fraunces',Georgia,'Times New Roman',serif;overflow:clip;isolation:isolate;}
.atlas ::selection{background:rgba(95,227,192,.22);color:#fff;}
.atlas-field{position:absolute;inset:0;z-index:-2;pointer-events:none;
  background:
    repeating-radial-gradient(circle at 72% 26%, transparent 0 33px, var(--line) 33px 34px),
    repeating-radial-gradient(circle at 18% 88%, transparent 0 41px, var(--line) 41px 42px);
  -webkit-mask-image:radial-gradient(130% 110% at 70% 20%, #000 12%, transparent 74%);
  mask-image:radial-gradient(130% 110% at 70% 20%, #000 12%, transparent 74%);opacity:.55;}
.atlas-datum{position:absolute;z-index:-1;pointer-events:none;border-radius:50%;
  background:radial-gradient(circle, rgba(95,227,192,.20), transparent 70%);filter:blur(2px);}
.atlas-glow{position:absolute;inset:0;z-index:-2;pointer-events:none;
  background:radial-gradient(46rem 40rem at 74% 8%, rgba(67,199,238,.12), transparent 62%),
    radial-gradient(40rem 34rem at 12% 96%, rgba(216,178,90,.08), transparent 60%);}
.atlas-wrap{max-width:78rem;margin:0 auto;padding:0 1.5rem;}
.atlas-eyebrow{font-family:var(--font-geist-mono),monospace;font-size:11px;letter-spacing:.34em;
  text-transform:uppercase;color:var(--survey);display:inline-flex;align-items:center;gap:.6rem;}
.atlas-eyebrow::before{content:'';width:2.2rem;height:1px;background:linear-gradient(90deg,transparent,var(--survey));}
.atlas-hero{min-height:100dvh;display:grid;align-items:center;padding:8rem 0 5rem;}
.atlas-h1{font-weight:400;font-size:clamp(3rem,9vw,7.5rem);line-height:.92;letter-spacing:-.01em;margin:1.6rem 0 0;max-width:15ch;}
.atlas-h1 em{font-style:italic;font-weight:300;
  background:linear-gradient(100deg,var(--survey),var(--survey2) 55%,var(--gold));
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.atlas-lede{margin:1.8rem 0 0;max-width:44ch;font-size:clamp(1.05rem,1.6vw,1.35rem);line-height:1.55;color:#c2ccce;font-weight:300;}
.atlas-cta{margin-top:2.4rem;display:flex;flex-wrap:wrap;gap:.9rem;align-items:center;}
.atlas-btn{font-family:var(--font-geist-mono),monospace;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;
  display:inline-flex;align-items:center;gap:.6rem;height:3rem;padding:0 1.4rem;border-radius:2px;
  transition:transform .3s cubic-bezier(.22,1,.36,1),background .3s,color .3s,border-color .3s;}
.atlas-btn--solid{background:var(--paper);color:var(--ink);}
.atlas-btn--solid:hover{transform:translateY(-2px);background:var(--survey);}
.atlas-btn--ghost{border:1px solid var(--line);color:#c2ccce;}
.atlas-btn--ghost:hover{border-color:var(--survey);color:#fff;transform:translateY(-2px);}
`;


const CSS_B = `
.atlas-legend{margin-top:3.4rem;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;
  background:var(--line);border:1px solid var(--line);border-radius:3px;overflow:hidden;max-width:40rem;}
.atlas-legend > div{background:var(--ink);padding:1.1rem 1.2rem;}
.atlas-legend .n{font-family:var(--font-geist-mono),monospace;font-size:1.7rem;color:#fff;}
.atlas-legend .l{font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.22em;
  text-transform:uppercase;color:var(--muted);margin-top:.35rem;}
.atlas-sec{padding:6rem 0;border-top:1px solid var(--line);}
.atlas-sec h2{font-weight:400;font-size:clamp(2rem,4vw,3.2rem);letter-spacing:-.01em;margin:.6rem 0 0;}
.atlas-sec .sub{color:var(--muted);font-family:var(--font-geist-mono),monospace;font-size:.8rem;
  letter-spacing:.04em;margin-top:.8rem;max-width:46ch;}
.atlas-plots{margin-top:3rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(19rem,1fr));gap:1px;
  background:var(--line);border:1px solid var(--line);border-radius:3px;overflow:hidden;}
.atlas-plot{background:var(--ink);padding:1.5rem 1.4rem 1.4rem;display:flex;flex-direction:column;text-decoration:none;
  min-height:13rem;position:relative;transition:background .35s;}
.atlas-plot:hover{background:var(--ink2);}
.atlas-plot .coord{font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.14em;color:var(--survey);}
.atlas-plot .name{margin-top:.7rem;font-size:1.3rem;line-height:1.2;color:#f2f5f4;}
.atlas-plot .loc{font-family:var(--font-geist-mono),monospace;font-size:11px;color:var(--muted);
  text-transform:uppercase;letter-spacing:.1em;margin-top:.4rem;}
.atlas-plot .foot{margin-top:auto;display:flex;align-items:baseline;justify-content:space-between;
  padding-top:1.1rem;border-top:1px dashed var(--line);}
.atlas-plot .price{font-family:var(--font-geist-mono),monospace;font-size:1.05rem;color:#fff;}
.atlas-plot .area{font-family:var(--font-geist-mono),monospace;font-size:11px;color:var(--muted);}
.atlas-tag{position:absolute;top:1.3rem;right:1.3rem;font-family:var(--font-geist-mono),monospace;
  font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);
  border:1px solid rgba(216,178,90,.3);padding:.18rem .45rem;border-radius:2px;}
.atlas-close{padding:7rem 0 8rem;border-top:1px solid var(--line);}
.atlas-close h2{font-weight:400;font-style:italic;font-size:clamp(2.2rem,5vw,4rem);max-width:18ch;line-height:1.05;}
.atlas-back{margin-top:2.5rem;}
.atlas-back a{font-family:var(--font-geist-mono),monospace;font-size:.75rem;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:.2rem;}
.atlas-back a:hover{color:var(--survey);border-color:var(--survey);}
@media (max-width:720px){.atlas-legend{grid-template-columns:1fr 1fr;}}
@media (prefers-reduced-motion:reduce){.atlas-btn{transition:none;}}
`;

const ATLAS_CSS = CSS_A + CSS_B;

const ATLAS_LEGEND = [
  { n: '1.500+', l: 'Imóveis catalogados' },
  { n: '10', l: 'Cidades mapeadas' },
  { n: '6', l: 'Modalidades' },
];

/**
 * "Atlas" — a distinct, intentional Cartographic-Surrealism landing proposal.
 * Self-contained: injects its own scoped CSS (ATLAS_CSS) and owns the
 * Fraunces/paper-on-ink survey aesthetic so it can be A/B compared against the
 * clean production landing without leaking styles. Reduced-motion safe.
 */
export function AtlasLanding({ plots }: { plots: AtlasPlot[] }) {
  return (
    <main className="atlas">
      <style>{ATLAS_CSS}</style>

      {/* Decorative layers: survey grid + brand glows. */}
      <div className="atlas-field" aria-hidden />
      <div className="atlas-glow" aria-hidden />

      <section className="atlas-hero">
        <div className="atlas-wrap">
          <span className="atlas-eyebrow">Cadastro cartográfico aberto</span>
          <h1 className="atlas-h1">
            O território imobiliário, <em>levantado</em> como dado.
          </h1>
          <p className="atlas-lede">
            Busca por cidade e tipo, mapa interativo, chat com IA e cálculo de
            investimento. 1.500 imóveis em 10 cidades — sem custo e sem login.
          </p>

          <div className="atlas-cta">
            <Link href="./regions" className="atlas-btn atlas-btn--solid">
              Explorar imóveis
              <span aria-hidden>→</span>
            </Link>
            <Link href="./map" className="atlas-btn atlas-btn--ghost">
              Abrir o mapa
              <span aria-hidden>↗</span>
            </Link>
          </div>

          <div className="atlas-legend">
            {ATLAS_LEGEND.map((item) => (
              <div key={item.l}>
                <div className="n">{item.n}</div>
                <div className="l">{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-sec">
        <div className="atlas-wrap">
          <h2>Levantamento de lotes</h2>
          <p className="sub">
            Amostra viva do cadastro. Cada plot é um imóvel georreferenciado por
            coordenada determinística.
          </p>

          <div className="atlas-plots">
            {plots.map((p) => (
              <Link key={p.id} href="./regions" className="atlas-plot">
                <span className="atlas-tag">{p.type}</span>
                <span className="coord">{datum(p.id)}</span>
                <div className="name">{p.title}</div>
                <div className="loc">
                  {p.city}/{p.state}
                </div>
                <div className="foot">
                  <span className="price">{formatBRL(p.price)}</span>
                  <span className="area">{formatM2(p.areaM2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-close">
        <div className="atlas-wrap">
          <h2>Volte ao mapa vivo.</h2>
          <div className="atlas-back">
            <Link href="./">← LandMap · início</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
