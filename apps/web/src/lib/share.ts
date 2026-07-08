export type ShareableProperty = {
  title: string;
  price: number;
  city: string;
  state: string;
  areaM2: number;
  type?: string;
  modality?: string;
  bedrooms?: number;
};

/**
 * Formats a property into a WhatsApp share text with link.
 * Returns the wa.me URL. The caller can open it via window.open or in an anchor.
 */
export function sharePropertyViaWhatsApp(property: ShareableProperty): string {
  const priceText = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const lines: string[] = [
    `*${property.title}*`,
    `💰 ${priceText}`,
    `📍 ${property.city}, ${property.state}`,
    `📐 ${property.areaM2} m²`,
  ];

  if (property.bedrooms) {
    lines.push(`🛏️ ${property.bedrooms} quarto(s)`);
  }
  if (property.type) {
    lines.push(`🏷️ ${property.type}`);
  }

  const url = typeof window !== 'undefined' ? window.location.href : '';
  lines.push(`🔗 ${url}`);
  lines.push('');
  lines.push('Via LandMap');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/?text=${text}`;
}
