import { searchProperties } from '../../../lib/api';
import { AtlasLanding, type AtlasPlot } from '../../../components/atlas/AtlasLanding';

export const dynamic = 'force-dynamic';

/**
 * /[locale]/v2 — "Atlas" design proposal.
 *
 * A distinct, intentional visual direction (Cartographic Surrealism) offered
 * side-by-side with the clean production landing so both can be compared.
 * Server component: fetches real featured inventory, then hands rendering to
 * the client landing which owns the scoped, self-contained styling.
 */
export default async function AtlasPage() {
  let plots: AtlasPlot[] = [];
  try {
    const res = await searchProperties({});
    plots = res.items.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      state: p.state,
      price: p.price,
      areaM2: p.areaM2,
      type: p.type,
      modality: p.modality,
    }));
  } catch {}

  return <AtlasLanding plots={plots} />;
}
