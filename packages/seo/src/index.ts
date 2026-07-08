export {
  buildPropertyListingPageSchema,
  buildOfferSchema,
  buildPlaceSchema,
  buildFaqPageSchema,
  buildHowToSchema,
  buildVideoObjectSchema,
  buildAnswerBoxSchema,
  SCHEMA_TYPES,
} from './generators.js';

export {
  buildPropertySchema,
  buildItemListSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from './schema.js';

export { buildCoverage } from './cli/coverage.js';
export { writeEnvHook, generateN8nHook } from './cli/n8n-hook.js';

export type {
  PropertyListingPageSchema,
  OfferSchema,
  PlaceSchema,
  FaqPageSchema,
  FaqItem,
  HowToSchema,
  HowToStepInput,
  VideoObjectSchema,
  AnswerBoxSchema,
  Modality,
  SchemaType,
} from './generators.js';

export type {
  PropertySchema,
  ItemListSchema,
  BreadcrumbListSchema,
  OrganizationSchema,
  WebSiteSchema,
} from './schema.js';
