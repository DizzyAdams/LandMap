'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { RequireAuth } from '../../../components/RequireAuth';
import { ArrowLeft, Check, Sparkles, TrendingUp } from '../../../components/lovable/icons';
import { Badge, Button, Card, Input, Skeleton, cn } from '@landmap/ui';
import {
  analyzeInspectionImage,
  getTerrain,
  scoreInvestment,
  type InvestScoreResponse,
  type InspectionAnalysis,
  type RealtimeValuation,
  type TerrainResponse,
  valueRealtime,
} from '../../../lib/api';

type AssetMode = 'imovel' | 'terreno';
type CameraState = 'idle' | 'starting' | 'live' | 'error';

type FrameQuality = {
  brightness: number;
  contrast: number;
  sharpness: number;
  score: number;
  verdict: 'boa' | 'ok' | 'ruim';
  notes: string[];
};

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function money(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function percentToFraction(n: number): number {
  return n / 100;
}

function decisionLabel(score: number, quality: number): { label: string; tone: 'success' | 'warning' | 'destructive' } {
  if (score >= 75 && quality >= 65) return { label: 'Comprar', tone: 'success' };
  if (score >= 60) return { label: 'Investigar', tone: 'warning' };
  return { label: 'Evitar', tone: 'destructive' };
}

function analyzePixels(imageData: ImageData): FrameQuality {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);

  let sum = 0;
  let sumSq = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const lum = data[idx] * 0.2126 + data[idx + 1] * 0.7152 + data[idx + 2] * 0.0722;
      gray[y * width + x] = lum;
      sum += lum;
      sumSq += lum * lum;
    }
  }

  let edgeSum = 0;
  for (let y = 1; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      const i = y * width + x;
      const gx = Math.abs(gray[i] - gray[i - 1]);
      const gy = Math.abs(gray[i] - gray[i - width]);
      edgeSum += gx + gy;
    }
  }

  const pixels = width * height;
  const avg = sum / pixels;
  const variance = Math.max(0, sumSq / pixels - avg * avg);
  const std = Math.sqrt(variance);
  const sharpnessRaw = edgeSum / Math.max(1, pixels - width - height);

  const brightnessScore = clamp(100 - Math.abs(avg - 130) * 1.1, 0, 100);
  const contrastScore = clamp(std * 2.1, 0, 100);
  const sharpnessScore = clamp(sharpnessRaw * 2.8, 0, 100);
  const exposurePenalty = avg < 45 || avg > 210 ? 20 : avg < 60 || avg > 195 ? 8 : 0;

  const score = Math.round(
    clamp(
      brightnessScore * 0.32 + contrastScore * 0.28 + sharpnessScore * 0.4 - exposurePenalty,
      0,
      100,
    ),
  );

  const notes: string[] = [];
  if (avg < 60) notes.push('Pouca luz');
  if (avg > 195) notes.push('Imagem estourada');
  if (std < 28) notes.push('Pouco contraste');
  if (sharpnessScore < 35) notes.push('Foco fraco');
  if (notes.length === 0) notes.push('Captura pronta para análise');

  return {
    brightness: Math.round(avg),
    contrast: Math.round(std),
    sharpness: Math.round(sharpnessScore),
    score,
    verdict: score >= 75 ? 'boa' : score >= 55 ? 'ok' : 'ruim',
    notes,
  };
}

function analysisToQuality(analysis: InspectionAnalysis): FrameQuality {
  return {
    brightness: analysis.brightness,
    contrast: analysis.contrast,
    sharpness: analysis.sharpness,
    score: analysis.score,
    verdict: analysis.verdict as FrameQuality['verdict'],
    notes: analysis.notes,
  };
}

function QualityGauge({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
          <div className="h-full rounded-full" style={{ width: `${clamp(value, 0, 100)}%`, background: tone }} />
        </div>
        <span className="w-10 text-right text-xs font-semibold tabular-nums">{Math.round(value)}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

function InspectPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<AssetMode>('imovel');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState<FrameQuality | null>(null);

  const [city, setCity] = useState('Salvador');
  const [neighborhood, setNeighborhood] = useState('Barra');
  const [areaM2, setAreaM2] = useState(120);
  const [price, setPrice] = useState(850000);
  const [monthlyRent, setMonthlyRent] = useState(5200);
  const [basePpm2, setBasePpm2] = useState(0);
  const [bedrooms, setBedrooms] = useState(3);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(7);
  const [annualExpensesPct, setAnnualExpensesPct] = useState(35);
  const [vacancyPct, setVacancyPct] = useState(8);
  const [annualAppreciationPct, setAnnualAppreciationPct] = useState(5);
  const [holdingYears, setHoldingYears] = useState(5);

  const [terrain, setTerrain] = useState<TerrainResponse | null>(null);
  const [terrainLoading, setTerrainLoading] = useState(false);
  const [terrainError, setTerrainError] = useState<string | null>(null);

  const [valuation, setValuation] = useState<RealtimeValuation | null>(null);
  const [investment, setInvestment] = useState<InvestScoreResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisBusy, setAnalysisBusy] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let active = true;
    const name = city.trim();

    if (!name) {
      setTerrain(null);
      setTerrainError(null);
      return;
    }

    setTerrainLoading(true);
    setTerrainError(null);
    const timer = setTimeout(() => {
      getTerrain(name)
        .then((data) => {
          if (!active) return;
          setTerrain(data);
        })
        .catch((err) => {
          if (!active) return;
          setTerrain(null);
          setTerrainError((err as Error)?.message || 'Falha ao carregar dados de terreno');
        })
        .finally(() => {
          if (active) setTerrainLoading(false);
        });
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [city]);

  const terrainBasePpm2 = useMemo(() => {
    if (basePpm2 > 0) return basePpm2;
    const kpis = terrain?.kpis;
    if (kpis?.avgPriceM2) return kpis.avgPriceM2;
    if (kpis?.medianPriceM2) return kpis.medianPriceM2;
    return areaM2 > 0 ? Math.round(price / areaM2) : 0;
  }, [areaM2, basePpm2, price, terrain]);

  const effectiveMonthlyRent = useMemo(() => {
    if (monthlyRent > 0) return monthlyRent;
    return Math.max(1, Math.round(price * 0.0055));
  }, [monthlyRent, price]);

  const qualityTone =
    quality?.verdict === 'boa'
      ? 'var(--success)'
      : quality?.verdict === 'ok'
        ? 'var(--warning)'
        : 'var(--destructive)';

  async function startCamera() {
    setCameraError(null);
    setCameraState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('live');
    } catch (err) {
      setCameraState('error');
      setCameraError((err as Error)?.message || 'Não foi possível abrir a câmera');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  }

  async function inspectFile(file: File) {
    try {
      return analysisToQuality(await analyzeInspectionImage(file));
    } catch {
      const src = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Falha ao carregar imagem'));
        image.src = src;
      });
      const canvas = document.createElement('canvas');
      const targetWidth = 240;
      const scale = targetWidth / Math.max(1, img.naturalWidth);
      canvas.width = targetWidth;
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas indisponível');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return analyzePixels(imageData);
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = canvasRef.current ?? document.createElement('canvas');
    canvasRef.current = canvas;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) return;
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    const src = URL.createObjectURL(blob);
    setFrameSrc(src);
    try {
      setQuality(await inspectFile(file));
    } catch (err) {
      setAnalysisError((err as Error)?.message || 'Falha ao analisar imagem');
    }
  }

  async function onUploadFile(file: File | null) {
    if (!file) return;
    const src = URL.createObjectURL(file);
    setFrameSrc(src);
    try {
      setQuality(await inspectFile(file));
    } catch (err) {
      setAnalysisError((err as Error)?.message || 'Falha ao analisar imagem');
    }
  }

  async function runAnalysis() {
    setAnalysisBusy(true);
    setAnalysisError(null);
    try {
      const [val, inv] = await Promise.all([
        areaM2 > 0
          ? valueRealtime({
              areaM2,
              type: mode === 'terreno' ? 'terreno' : 'apartamento',
              bedrooms: mode === 'imovel' ? bedrooms : undefined,
              basePpm2: terrainBasePpm2 > 0 ? terrainBasePpm2 : null,
              yoyPct: percentToFraction(annualAppreciationPct),
              volatility: quality ? clamp(1 - quality.score / 100, 0, 1) : 0.25,
              isLaunch: mode === 'terreno',
            })
          : Promise.resolve(null),
        scoreInvestment({
          price,
          monthlyRent: effectiveMonthlyRent,
          downPaymentPct: percentToFraction(downPaymentPct),
          interestRatePct,
          loanTermYears: 30,
          annualExpensesPct: percentToFraction(annualExpensesPct),
          vacancyPct: percentToFraction(vacancyPct),
          annualAppreciationPct: percentToFraction(annualAppreciationPct),
          holdingYears,
        }),
      ]);

      if (val) setValuation(val);
      setInvestment(inv);
    } catch (err) {
      setAnalysisError((err as Error)?.message || 'Falha ao calcular análise');
    } finally {
      setAnalysisBusy(false);
    }
  }

  const decision = useMemo(() => {
    if (!investment) return null;
    return decisionLabel(investment.score, quality?.score ?? 0);
  }, [investment, quality]);

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(80,92,255,0.08),transparent_30%),linear-gradient(180deg,var(--background),var(--background))] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={lh('/dashboard')}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="outline">mobile first</Badge>
            <Badge variant="info">camera assistida</Badge>
          </div>
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Captura assistida
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
                  Vale a pena este imóvel ou terreno?
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
                  Abra a câmera, capture a fachada ou o lote, valide a qualidade da imagem e receba
                  valuation, cap rate, cash-on-cash e leitura territorial no mesmo fluxo.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1">
                {(['imovel', 'terreno'] as AssetMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition',
                      mode === item
                        ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm'
                        : 'text-[var(--muted-foreground)]',
                    )}
                  >
                    {item === 'imovel' ? 'Imóvel' : 'Terreno'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Câmera</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Use a lente traseira para capturar o estado aparente do ativo.
                      </p>
                    </div>
                    <Badge variant={cameraState === 'live' ? 'success' : 'outline'}>
                      {cameraState === 'live' ? 'ao vivo' : cameraState === 'starting' ? 'abrindo' : 'parada'}
                    </Badge>
                  </div>

                  <div className="relative aspect-[4/3] bg-[var(--muted)]">
                    {frameSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={frameSrc} alt="Imagem capturada" className="h-full w-full object-cover" />
                    ) : (
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                    )}
                    {!frameSrc && cameraState !== 'live' && (
                      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.08))] p-6 text-center">
                        <div className="max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-4 shadow-sm backdrop-blur">
                          <p className="text-sm font-medium">Abra a câmera para iniciar.</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            Se a permissão falhar, envie uma foto do ativo para análise local.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-4 py-3">
                    <Button type="button" variant={cameraState === 'live' ? 'outline' : 'default'} onClick={cameraState === 'live' ? stopCamera : startCamera}>
                      {cameraState === 'live' ? 'Parar câmera' : 'Abrir câmera'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void captureFrame()} disabled={cameraState !== 'live'}>
                      Capturar frame
                    </Button>
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                      Enviar foto
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        void onUploadFile(e.target.files?.[0] ?? null);
                        e.currentTarget.value = '';
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <QualityGauge label="Brilho" value={quality?.brightness ?? 0} tone="var(--primary)" />
                  <QualityGauge label="Contraste" value={Math.min(100, (quality?.contrast ?? 0) * 2)} tone="var(--success)" />
                  <QualityGauge label="Nitidez" value={quality?.sharpness ?? 0} tone="var(--warning)" />
                </div>

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Leitura visual</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Pré-filtro de imagem para reduzir erro de captura antes do valuation.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold tabular-nums" style={{ color: qualityTone }}>
                        {quality ? quality.score : '--'}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {quality?.verdict ?? 'aguardando'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quality?.notes?.map((note) => (
                      <span
                        key={note}
                        className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs text-[var(--foreground)]"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Dados do ativo</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Ajuste o contexto para o valuation e para o score de investimento.
                      </p>
                    </div>
                    <Badge variant="outline">{mode === 'imovel' ? 'underwriting' : 'land bank'}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input label="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                    <Input
                      label="Área m²"
                      type="number"
                      min={1}
                      value={areaM2}
                      onChange={(e) => setAreaM2(Number(e.target.value))}
                    />
                    <Input
                      label="Preço"
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                    <Input
                      label={mode === 'imovel' ? 'Aluguel mensal' : 'Aluguel proxy'}
                      type="number"
                      min={0}
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    />
                    <Input
                      label="Base R$/m²"
                      type="number"
                      min={0}
                      value={basePpm2}
                      onChange={(e) => setBasePpm2(Number(e.target.value))}
                    />
                    <Input
                      label="Entrada %"
                      type="number"
                      min={0}
                      max={100}
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    />
                    <Input
                      label="Juros % a.a."
                      type="number"
                      min={0}
                      value={interestRatePct}
                      onChange={(e) => setInterestRatePct(Number(e.target.value))}
                    />
                    <Input
                      label="Despesas %"
                      type="number"
                      min={0}
                      max={100}
                      value={annualExpensesPct}
                      onChange={(e) => setAnnualExpensesPct(Number(e.target.value))}
                    />
                    <Input
                      label="Vacância %"
                      type="number"
                      min={0}
                      max={100}
                      value={vacancyPct}
                      onChange={(e) => setVacancyPct(Number(e.target.value))}
                    />
                    <Input
                      label="Valorização %"
                      type="number"
                      min={0}
                      max={100}
                      value={annualAppreciationPct}
                      onChange={(e) => setAnnualAppreciationPct(Number(e.target.value))}
                    />
                    <Input
                      label="Horizonte (anos)"
                      type="number"
                      min={1}
                      max={30}
                      value={holdingYears}
                      onChange={(e) => setHoldingYears(Number(e.target.value))}
                    />
                    {mode === 'imovel' && (
                      <Input
                        label="Quartos"
                        type="number"
                        min={0}
                        max={20}
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                      />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" onClick={() => void runAnalysis()} disabled={analysisBusy}>
                      {analysisBusy ? 'Analisando…' : 'Rodar análise'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void runAnalysis()}>
                      Atualizar KPIs
                    </Button>
                  </div>

                  {cameraError && <p className="mt-3 text-sm text-[var(--destructive)]">{cameraError}</p>}
                  {analysisError && <p className="mt-3 text-sm text-[var(--destructive)]">{analysisError}</p>}
                </div>

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Território</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        KPIs locais para contextualizar a decisão.
                      </p>
                    </div>
                    <Badge variant="outline">{terrainLoading ? 'carregando' : terrain?.total ?? 0} lotes</Badge>
                  </div>

                  {terrainLoading ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : terrainError ? (
                    <p className="mt-4 text-sm text-[var(--muted-foreground)]">{terrainError}</p>
                  ) : terrain?.kpis ? (
                    <>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <StatCard label="Preço médio/m²" value={money(terrain.kpis.avgPriceM2)} hint="média dos terrenos do city scope" />
                        <StatCard label="Mediana/m²" value={money(terrain.kpis.medianPriceM2)} hint="referência de compra" />
                        <StatCard label="Valorização média" value={pct(terrain.kpis.avgAppreciationPct)} hint="derivada do histórico" />
                        <StatCard label="Build score" value={String(terrain.kpis.avgBuildScore)} hint="potencial construtivo agregado" />
                      </div>

                      <div className="mt-4 space-y-2">
                        {terrain.plots.slice(0, 3).map((plot) => (
                          <div key={plot.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{plot.title}</p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {plot.neighborhood} · {plot.city}/{plot.state}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold tabular-nums">{money(plot.pricePerM2)}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                                score {plot.score}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/40 p-4 text-sm text-[var(--muted-foreground)]">
                      Digite uma cidade para carregar os KPIs territoriais.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Resultado</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Valuation e underwriting consolidados.
                  </p>
                </div>
                {decision && <Badge variant={decision.tone}>{decision.label}</Badge>}
              </div>

              {!valuation || !investment ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/40 p-4 text-sm text-[var(--muted-foreground)]">
                  Rode a análise para ver preço estimado, cap rate, cash-on-cash e IRR.
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Preço estimado" value={money(valuation.predictedPrice)} />
                  <StatCard label="R$/m² estimado" value={money(valuation.pricePerM2)} />
                  <StatCard label="Cap rate" value={pct(investment.capRate * 100)} />
                  <StatCard label="Cash-on-cash" value={pct(investment.cashOnCash * 100)} />
                  <StatCard label="IRR" value={pct(investment.irrPct * 100)} />
                  <StatCard label="Score" value={`${Math.round(investment.score)} / 100`} />
                </div>
              )}

              {investment && (
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Grade {investment.grade}</Badge>
                    <Badge variant="outline">NOI {money(investment.netOperatingIncome)}</Badge>
                    <Badge variant="outline">Mensal {money(investment.monthlyCashflow)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    {mode === 'terreno'
                      ? 'Para terreno, o score financeiro usa renda proxy e deve ser lido junto com os KPIs territoriais.'
                      : 'Para imóvel, os KPIs financeiros e a leitura visual podem ser usados como triagem antes da visita.'}
                  </p>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Próximos passos</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Encadeie a decisão no fluxo existente.
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <Link href={lh('/kpis')} className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:bg-[var(--muted)]">
                  Abrir KPIs de mercado
                </Link>
                <Link href={lh('/search')} className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:bg-[var(--muted)]">
                  Refinar busca de ativos
                </Link>
                <Link href={lh('/map')} className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:bg-[var(--muted)]">
                  Validar no mapa
                </Link>
              </div>
            </Card>

            {quality && (
              <Card>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  <p className="text-sm font-semibold">Checklist de captura</p>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li>• {quality.notes[0]}</li>
                  <li>• Cidade: {city || '—'}</li>
                  <li>• Bairro: {neighborhood || '—'}</li>
                  <li>• Captura: {frameSrc ? 'anexada' : 'pendente'}</li>
                </ul>
              </Card>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function InspectPage() {
  return (
    <RequireAuth>
      <InspectPageInner />
    </RequireAuth>
  );
}
