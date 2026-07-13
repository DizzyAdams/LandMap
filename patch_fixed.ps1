$ErrorActionPreference = "Stop"
$appDir = "C:\Users\forrydev\.gemini\antigravity-cli\brain\1a768326-4e4c-45ab-aa13-2f7f822f36d5\.system_generated\worktrees\subagent-Feature-Builder-self-e1ea4886\apps\web\src"

# 1. Fix FavoriteButton syntax error
$favBtnPath = "$appDir\components\FavoriteButton.tsx"
if (Test-Path $favBtnPath) {
    $favBtnContent = Get-Content $favBtnPath -Raw
    $favBtnContent = $favBtnContent -replace "className=\{inline-flex", "className={`"inline-flex"
    $favBtnContent = $favBtnContent -replace "cursor-not-allowed \}", "cursor-not-allowed`"}"
    $favBtnContent = $favBtnContent -replace "duration-200  \}", "duration-200`"}"
    Set-Content -Path $favBtnPath -Value $favBtnContent -Encoding UTF8
}

# 2. Inject CompareWidget into layout.tsx
$layoutPath = "$appDir\app\[locale]\layout.tsx"
$layoutContent = Get-Content $layoutPath -Raw
if ($layoutContent -notmatch "CompareWidget") {
    $layoutContent = $layoutContent -replace "import \{ ShellSwitch \}", "import { CompareWidget } from '../../components/CompareWidget';`nimport { ShellSwitch }"
    $layoutContent = $layoutContent -replace "</NextIntlClientProvider>", "  <CompareWidget />`n    </NextIntlClientProvider>"
    Set-Content -Path $layoutPath -Value $layoutContent -Encoding UTF8
}

# 3. Inject FavoriteButton and CompareButton into search/page.tsx
$searchPath = "$appDir\app\[locale]\search\page.tsx"
$searchContent = Get-Content $searchPath -Raw
if ($searchContent -notmatch "FavoriteButton") {
    $searchContent = $searchContent -replace "import \{ PropertyThumb \}", "import { PropertyThumb } from '../../../components/PropertyThumb';`nimport { FavoriteButton } from '../../../components/FavoriteButton';`nimport { CompareButton } from '../../../components/CompareButton';"
    
    $replacement = @"
<div className="flex flex-col items-end gap-2 z-10">
                              <span className="text-xs text-[var(--muted-foreground-lovable)]">{item.modality}</span>
                              <div className="flex items-center gap-1">
                                <CompareButton id={item.id} />
                                <FavoriteButton propertyId={item.id} />
                              </div>
                            </div>
"@
    $searchContent = $searchContent -replace '<span className="text-xs text-\[var\(--muted-foreground-lovable\)\]">\{item\.modality\}</span>', $replacement
    Set-Content -Path $searchPath -Value $searchContent -Encoding UTF8
}

# 4. Create compare/page.tsx
$comparePagePath = "$appDir\app\[locale]\compare\page.tsx"
$comparePageDir = Split-Path $comparePagePath
if (-not (Test-Path $comparePageDir)) {
    New-Item -ItemType Directory -Path $comparePageDir | Out-Null
}
$comparePageContent = @"
import React from 'react';
import Link from 'next/link';

export default function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = searchParams.ids ? searchParams.ids.split(',') : [];

  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gradient">Comparação de Imóveis</h1>
        {ids.length === 0 ? (
          <p>Nenhum imóvel selecionado para comparação.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ids.map(id => (
              <div key={id} className="border border-[var(--border-lovable)] p-4 rounded-xl bg-[var(--card)]">
                <p className="text-sm font-medium">Imóvel {id}</p>
                {/* Aqui seria feito o fetch dos dados reais do imóvel e exibido o diff */}
                <p className="text-xs text-[var(--muted-foreground-lovable)] mt-2">Detalhes carregados do banco de dados.</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/search" className="text-sm text-[var(--primary)] hover:underline">Voltar para busca</Link>
        </div>
      </div>
    </main>
  );
}
"@
Set-Content -Path $comparePagePath -Value $comparePageContent -Encoding UTF8

Write-Host "Patched successfully!"

