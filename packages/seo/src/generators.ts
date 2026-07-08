export type PropertyType =
  | 'SingleFamilyResidence'
  | 'Apartment'
  | 'Commercial'
  | 'Land';

export type PropertyListingPageSchema = {
  '@context': 'https://schema.org';
  '@type': 'PropertyListingPage';
  name: string;
  description?: string;
  url?: string;
  mainEntity: {
    '@type': PropertyType;
    name: string;
    description?: string;
    address: {
      '@type': 'PostalAddress';
      addressLocality: string;
      addressRegion: string;
      addressCountry?: string;
      postalCode?: string;
      streetAddress?: string;
    };
    offers?: {
      '@type': 'Offer';
      price: number;
      priceCurrency?: string;
      availability?: string;
      url?: string;
    };
    floorSize?: {
      '@type': 'QuantitativeValue';
      value: number;
      unitCode?: string;
    };
    numberOfRooms?: number;
    numberOfBathroomsTotal?: number;
    photo?: string[];
  };
};

export type OfferSchema = {
  '@context': 'https://schema.org';
  '@type': 'Offer';
  price: number;
  priceCurrency: string;
  availability: string;
  url?: string;
  seller?: {
    '@type': 'Organization';
    name: string;
  };
};

export type PlaceSchema = {
  '@context': 'https://schema.org';
  '@type': 'Place';
  name: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressRegion: string;
    addressCountry?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string;
    opens: string;
    closes: string;
  }>;
};

export type FaqPageSchema = {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HowToSchema = {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description?: string;
  step: Array<{
    '@type': 'HowToStep';
    name: string;
    text: string;
    url?: string;
    image?: string;
  }>;
  totalTime?: string;
  estimatedCost?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: number;
  };
};

export type HowToStepInput = {
  name: string;
  text: string;
  url?: string;
  image?: string;
};

export type VideoObjectSchema = {
  '@context': 'https://schema.org';
  '@type': 'VideoObject';
  name: string;
  description?: string;
  thumbnailUrl: string[];
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  hasPart?: {
    '@type': 'Clip';
    name: string;
    startOffset: number;
    endOffset: number;
  };
};

export type Modality =
  | 'venda'
  | 'aluguel'
  | 'lancamento'
  | string;

type ModalityMap = Record<string, string | undefined>;

const modalityAvailability: ModalityMap = {
  venda: 'https://schema.org/InStock',
  aluguel: 'https://schema.org/InStock',
  lancamento: 'https://schema.org/PreOrder',
};

const propertyTypeMap: Record<string, PropertyType> = {
  apartamento: 'Apartment',
  casa: 'SingleFamilyResidence',
  terreno: 'Land',
  comercial: 'Commercial',
};

export function buildPropertyListingPageSchema(
  property: {
    title: string;
    city: string;
    state: string;
    price: number;
    areaM2: number;
    bedrooms?: number;
    bathrooms?: number;
    type?: string;
    modality?: Modality;
    url?: string;
    street?: string;
    postalCode?: string;
    country?: string;
    description?: string;
    photo?: string[];
  },
): PropertyListingPageSchema {
  const typeValue = property.type ?? 'apartamento';
  const type = propertyTypeMap[typeValue] ?? 'Apartment';

  return {
    '@context': 'https://schema.org',
    '@type': 'PropertyListingPage',
    name: property.title,
    description: property.description ?? `Imóvel em ${property.city}/${property.state}.`,
    url: property.url,
    mainEntity: {
      '@type': type,
      name: property.title,
      description: property.description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.city,
        addressRegion: property.state,
        addressCountry: property.country ?? 'BR',
        postalCode: property.postalCode,
        streetAddress: property.street,
      },
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'BRL',
        availability: modalityAvailability[property.modality ?? 'venda'],
        url: property.url,
      },
      ...(property.areaM2
        ? {
            floorSize: {
              '@type': 'QuantitativeValue',
              value: property.areaM2,
              unitCode: 'm2',
            },
          }
        : {}),
      ...(typeof property.bedrooms === 'number'
        ? { numberOfRooms: property.bedrooms }
        : {}),
      ...(typeof property.bathrooms === 'number'
        ? { numberOfBathroomsTotal: property.bathrooms }
        : {}),
      ...(Array.isArray(property.photo) && property.photo.length
        ? { photo: property.photo }
        : {}),
    },
  };
}

export function buildOfferSchema(offer: {
  price: number;
  currency?: string;
  availability?: string;
  url?: string;
  sellerName?: string;
}): OfferSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    price: offer.price,
    priceCurrency: offer.currency ?? 'BRL',
    availability: offer.availability ?? 'https://schema.org/InStock',
    url: offer.url,
    ...(offer.sellerName
      ? {
          seller: {
            '@type': 'Organization',
            name: offer.sellerName,
          },
        }
      : {}),
  };
}

export function buildPlaceSchema(place: {
  name: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
  street?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  openingHours?: Array<{ day: string; opens: string; closes: string }>;
}): PlaceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place.name,
    description: place.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: place.city,
      addressRegion: place.state,
      addressCountry: place.country ?? 'BR',
      postalCode: place.postalCode,
      streetAddress: place.street,
    },
    ...(typeof place.latitude === 'number' &&
    typeof place.longitude === 'number'
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: place.latitude,
            longitude: place.longitude,
          },
        }
      : {}),
    ...(place.telephone ? { telephone: place.telephone } : {}),
    ...(Array.isArray(place.openingHours) && place.openingHours.length
      ? {
          openingHoursSpecification: place.openingHours.map((hour) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: hour.day,
            opens: hour.opens,
            closes: hour.closes,
          })),
        }
      : {}),
  };
}

export function buildFaqPageSchema(items: FaqItem[]): FaqPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildHowToSchema(input: {
  name: string;
  description?: string;
  steps: HowToStepInput[];
  totalTime?: string;
  currency?: string;
  estimatedCost?: number;
}): HowToSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      url: step.url,
      image: step.image,
    })),
    totalTime: input.totalTime,
    ...(typeof input.estimatedCost === 'number'
      ? {
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: input.currency ?? 'BRL',
            value: input.estimatedCost,
          },
        }
      : {}),
  };
}

export function buildVideoObjectSchema(video: {
  name: string;
  description?: string;
  thumbnailUrl: string[];
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  clipName?: string;
  clipStart?: number;
  clipEnd?: number;
}): VideoObjectSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    ...(typeof video.clipStart === 'number' &&
    typeof video.clipEnd === 'number' &&
    video.clipName
      ? {
          hasPart: {
            '@type': 'Clip',
            name: video.clipName,
            startOffset: video.clipStart,
            endOffset: video.clipEnd,
          },
        }
      : {}),
  };
}

export const SCHEMA_TYPES = [
  'PropertyListingPage',
  'Offer',
  'Place',
  'FAQPage',
  'HowTo',
  'VideoObject',
] as const;

export type AnswerBoxSchema = {
  '@context': 'https://schema.org';
  '@type': 'QAPage' | 'WebPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
      upvoteCount?: number;
      url?: string;
    };
    suggestedAnswer?: Array<{
      '@type': 'Answer';
      text: string;
      upvoteCount?: number;
      url?: string;
    }>;
  };
};

export function buildAnswerBoxSchema(input: {
  question: string;
  answer: string;
  upvoteCount?: number;
  url?: string;
  suggestedAnswers?: Array<{ text: string; upvoteCount?: number; url?: string }>;
}): AnswerBoxSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: input.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: input.answer,
        ...(typeof input.upvoteCount === 'number' ? { upvoteCount: input.upvoteCount } : {}),
        ...(input.url ? { url: input.url } : {}),
      },
      ...(Array.isArray(input.suggestedAnswers) && input.suggestedAnswers.length
        ? {
            suggestedAnswer: input.suggestedAnswers.map((s) => ({
              '@type': 'Answer',
              text: s.text,
              ...(typeof s.upvoteCount === 'number' ? { upvoteCount: s.upvoteCount } : {}),
              ...(s.url ? { url: s.url } : {}),
            })),
          }
        : {}),
    },
  };
}

export type SchemaType = (typeof SCHEMA_TYPES)[number];
