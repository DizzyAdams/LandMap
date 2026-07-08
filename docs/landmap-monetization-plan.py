from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

for name, path in [('Arial', 'C:/Windows/Fonts/arial.ttf'), ('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf')]:
    try:
        pdfmetrics.registerFont(TTFont(name, path))
    except Exception:
        pass

output_path = 'C:/Users/forrydev/Desktop/Pdfs-landmap/landmap-monetization-plan.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4,
                        rightMargin=2*cm, leftMargin=2*cm,
                        topMargin=2*cm, bottomMargin=2*cm)

base_styles = getSampleStyleSheet()
title_style = ParagraphStyle(name='LandMapTitle', parent=base_styles['Title'], fontName='Arial-Bold', fontSize=16, leading=22, alignment=1, spaceAfter=16, textColor=colors.HexColor('#111827'))
heading_style = ParagraphStyle(name='LandMapHeading1', parent=base_styles['Heading1'], fontName='Arial-Bold', fontSize=13, leading=18, spaceAfter=10, spaceBefore=18, textColor=colors.HexColor('#111827'))
body_style = ParagraphStyle(name='LandMapBody', parent=base_styles['Body'], fontName='Arial', fontSize=10.5, leading=15, spaceAfter=6)
bullet_style = ParagraphStyle(name='LandMapBullet', parent=body_style, leftIndent=18, bulletIndent=6, spaceAfter=4)
small_note_style = ParagraphStyle(name='LandMapSmall', parent=base_styles['Normal'], fontName='Arial', fontSize=9.5, leading=14, textColor=colors.grey)

story = []
story.append(Paragraph('LandMap — Plano de Gastos 6k + URLs de APIs, Tokens e VPS', title_style))
story.append(Paragraph('Objetivo: tornar o LandMap uma plataforma de inteligência imobiliária com API comercial, focada em APIs de dados, leads qualificados, relatórios e integração com CRM. Investimento enxuto de até 6.000 BRL.', body_style))
story.append(Spacer(1, 8))

story.append(Paragraph('1. Estratégia de monetização por API', heading_style))
story.append(Paragraph('Monetize usando 4 frentes principais voltadas a donos de projeto, corretores e imobiliárias:', body_style))
story.append(Paragraph('• API de busca e matching de imóveis: filtros, similaridade, alertas e comparativos.', bullet_style))
story.append(Paragraph('• API de leads qualificados: pagamento por lead qualificado enviado ao proprietário / parceiro.', bullet_style))
story.append(Paragraph('• API de comparativos e relatórios: relatórios de bairro, valorização, regiões e imóveis similares.', bullet_style))
story.append(Paragraph('• API de integração Twenty-first: sincronização de oportunidades e funis comerciais via API.', bullet_style))
story.append(Paragraph('• API de SEO/AEO schema: entrega de JSON-LD, sitemap e regras para indexação como serviço pago.', bullet_style))

story.append(Paragraph('2. Serviços obrigatórios para APIs e sites', heading_style))
story.append(Paragraph('Serviços/APIs que irão sustentar o produto e seus respectivos custos:', body_style))
rows = [
    ['Serviço', 'Finalidade / Provedor'],
    ['Hosting / VPS', 'Hetzner Cloud CX22 / VPS Aper — servidor barato na Europa para APIs, webhooks, workers e pequenos bancos.'],
    ['Banco / Data', 'Supabase / Neon banco serverless Postgres e storage. Neon free inicial, Supabase gratuito até certo tráfego.'],
    ['Autenticação', 'Clerk.dev / Supabase Auth (auth gerenciado e chaves de API revogáveis).'],
    ['Pagamentos / Billing', 'Stripe ou Mercado Pago. Mercado Pago preferível para mercado BR, com split de pagamento para parceiros.'],
    ['Email / Notificações', 'Resend ou Loopsmail para transacionais, alertas de leads e onboarding.'],
    ['Mapas / Geocodificação', 'Mapbox / Google Maps Platform para geocodificação de imóveis e cluster no mapa.'],
    ['Embeddings / LLM', 'OpenAI / Gemini / Groq para análise semântica dos anúncios. Priorize Gemini 2.0 Flash / Groq por custo/performance.'],
    ['CRM', 'Twenty-first REST + GraphQL (self-hosted ou SaaS) — dependendo do plano.'],
    ['CI / Deploy', 'GitHub Actions + Vercel para web; n8n Cloud para automação em produção.'],
    ['Monitoramento', 'Uptime / BetterStack + logs estruturados.'],
]
table = Table(rows, colWidths=[7*cm, 11*cm], repeatRows=1)
table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Arial-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 9.5),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f2937')),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
    ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
    ('FONTNAME', (0,1), (-1,-1), 'Arial'),
    ('FONTSIZE', (0,1), (-1,-1), 9.5),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
]))
story.append(table)
story.append(Spacer(1, 8))

story.append(Paragraph('3. Planilha de gastos — orçamento 6.000 BRL', heading_style))
story.append(Paragraph('Distribuição mensal aproximada por 6 meses para chegar a MVP comercializável:', body_style))

rows = [
    ['Serviço', 'Custo/mês', 'Meses', 'Total BRL'],
    ['VPS / infra', '120', '6', '720'],
    ['Banco + storage', '90', '6', '540'],
    ['Auth / usuários', '60', '6', '360'],
    ['Mapas / geo', '200', '6', '1.200'],
    ['LLM / embeddings', '240', '6', '1.440'],
    ['Email / notificacoes', '60', '6', '360'],
    ['CRM Twenty', '150', '6', '900'],
    ['Pagamentos', '80', '6', '480'],
    ['CI / Deploy', '0', '6', '0'],
    ['Monitoramento', '30', '6', '180'],
    ['Reserva / risco', '180', '6', '1.080'],
    ['TOTAL', '-', '-', '6.260'],
]

budget_table = Table(rows, colWidths=[5.8*cm, 3.2*cm, 2.4*cm, 3.2*cm], repeatRows=1)
budget_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Arial-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 9.5),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
    ('BACKGROUND', (0,1), (-1,-2), colors.whitesmoke),
    ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#f3f4f6')),
    ('FONTNAME', (0,-1), (-1,-1), 'Arial-Bold'),
    ('FONTNAME', (0,1), (-1,-2), 'Arial'),
    ('FONTSIZE', (0,1), (-1,-1), 9.5),
    ('ALIGN', (1,1), (-1,-1), 'CENTER'),
    ('LEFTPADDING', (0,0), (-1,-1), 10),
    ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
]))
story.append(budget_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Corte opcional: reduza mapas/geo para 90 e LLM para 150 -> total ~5.160 BRL.', small_note_style))
story.append(Paragraph('Prioridade de corte: 1) reserva/risco, 2) monitoramento, 3) mapas, 4) LLM.', small_note_style))
story.append(Spacer(1, 4))

story.append(Paragraph('4. URLs e serviços oficiais para usar no futuro', heading_style))
story.append(Paragraph('Use estes sites para contratar, documentar e rodar o produto:', body_style))

story.append(Paragraph('Infra / VPS / Banco:', heading_style))
story.append(Paragraph('• Hetzner Cloud — <a href="https://www.hetzner.com/cloud" color="blue">https://www.hetzner.com/cloud</a>', bullet_style))
story.append(Paragraph('• Neon — <a href="https://neon.tech" color="blue">https://neon.tech</a>', bullet_style))
story.append(Paragraph('• Supabase — <a href="https://supabase.com" color="blue">https://supabase.com</a>', bullet_style))

story.append(Paragraph('Auth:', heading_style))
story.append(Paragraph('• Clerk — <a href="https://clerk.com" color="blue">https://clerk.com</a>', bullet_style))
story.append(Paragraph('• Supabase Auth — <a href="https://supabase.com/docs/guides/auth" color="blue">https://supabase.com/docs/guides/auth</a>', bullet_style))

story.append(Paragraph('Mapas / Geo:', heading_style))
story.append(Paragraph('• Mapbox API — <a href="https://docs.mapbox.com/api/" color="blue">https://docs.mapbox.com/api/</a>', bullet_style))
story.append(Paragraph('• Google Maps — <a href="https://developers.google.com/maps/documentation" color="blue">https://developers.google.com/maps/documentation</a>', bullet_style))

story.append(Paragraph('LLM / Embeddings / IA:', heading_style))
story.append(Paragraph('• OpenAI — <a href="https://platform.openai.com/docs" color="blue">https://platform.openai.com/docs</a>', bullet_style))
story.append(Paragraph('• Gemini — <a href="https://ai.google.dev/gemini-api" color="blue">https://ai.google.dev/gemini-api</a>', bullet_style))
story.append(Paragraph('• Groq — <a href="https://console.groq.com/docs" color="blue">https://console.groq.com/docs</a>', bullet_style))
story.append(Paragraph('• LangChain — <a href="https://python.langchain.com/" color="blue">https://python.langchain.com/</a>', bullet_style))

story.append(Paragraph('Pagamentos / Split / Billing:', heading_style))
story.append(Paragraph('• Mercado Pago — <a href="https://www.mercadopago.com.br/developers" color="blue">https://www.mercadopago.com.br/developers</a>', bullet_style))
story.append(Paragraph('• Stripe — <a href="https://stripe.com/docs/api" color="blue">https://stripe.com/docs/api</a>', bullet_style))
story.append(Paragraph('• Pagar.me — <a href="https://docs.pagar.me" color="blue">https://docs.pagar.me</a>', bullet_style))

story.append(Paragraph('CRM / Automação / Deploy:', heading_style))
story.append(Paragraph('• Twenty — <a href="https://docs.twenty.com" color="blue">https://docs.twenty.com</a>', bullet_style))
story.append(Paragraph('• n8n — <a href="https://docs.n8n.io" color="blue">https://docs.n8n.io</a>', bullet_style))
story.append(Paragraph('• Vercel — <a href="https://vercel.com/docs" color="blue">https://vercel.com/docs</a>', bullet_style))
story.append(Paragraph('• GitHub Actions — <a href="https://docs.github.com/en/actions" color="blue">https://docs.github.com/en/actions</a>', bullet_style))

story.append(Paragraph('5. Tokens para APIs — onde obter', heading_style))
story.append(Paragraph('Cada serviço pago/SaaS exige uma chave/token no respectivo painel:', body_style))
story.append(Paragraph('• Google Cloud Console -> APIs: Maps/Distance/Geocoding', bullet_style))
story.append(Paragraph('• OpenAI API Keys — platform.openai.com/api-keys', bullet_style))
story.append(Paragraph('• Gemini API Keys — aistudio.google.com/apikey', bullet_style))
story.append(Paragraph('• Groq API Keys — console.groq.com/keys', bullet_style))
story.append(Paragraph('• Mercado Pago — credentials no painel do APP -> production/access_token', bullet_style))
story.append(Paragraph('• Stripe — Developers > API keys', bullet_style))
story.append(Paragraph('• Supabase — Project Settings > API > anon/service_role keys', bullet_style))
story.append(Paragraph('• Clerk — API Keys no dashboard', bullet_style))
story.append(Paragraph('• Resend — API Keys no domínio verificado', bullet_style))
story.append(Paragraph('• Twenty — API Keys ou integração OAuth no Twenty Cloud / self-hosted', bullet_style))

story.append(Paragraph('6. Ordem de execução enxuta', heading_style))
story.append(Paragraph('Chegue a API comercializável gastando até 6k:', body_style))
story.append(Paragraph('• Semana 1-2: VPS + banco + auth + rotas base das APIs.', bullet_style))
story.append(Paragraph('• Semana 3-4: integração mapas + seed de imóveis + endpoints de busca.', bullet_style))
story.append(Paragraph('• Semana 5-6: LLM leve e comparativos + billing + webhooks.', bullet_style))
story.append(Paragraph('• Semana 7-8: CRM Twenty + leads + email transacional + monitoramento.', bullet_style))
story.append(Paragraph('• Semana 9-12: onboarding de 2-3 clientes beta, ajustes, pricing.', bullet_style))
story.append(Spacer(1, 4))

story.append(Paragraph('Obs.: mantenha o design mono dark premium, sem criatividades coloridas. Cada API comercial deve ter chave, rate limit, plano por uso e portal do desenvolvedor. Não commitar segredos; usar variáveis de ambiente e secret manager.', small_note_style))

doc.build(story)
print(f'PDF generated: {output_path}')
