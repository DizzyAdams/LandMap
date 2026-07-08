export type PropertySchema = {
  '@context': 'https://schema.org';
  '@type': 'SingleFamilyResidence' | 'Apartment' | 'Commercial' | 'Land';
  name: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressRegion: string;
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
};

export type ItemListSchema = {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    url?: string;
    name: string;
  }>;
};

export type BreadcrumbListSchema = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
};

export function buildPropertySchema(property: {
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  type?: string;
  modality?: string;
  url?: string;
}): PropertySchema {
  const typeMap: Record<string, PropertySchema['@type']> = {
    apartamento: 'Apartment',
    casa: 'SingleFamilyResidence',
    terreno: 'Land',
    comercial: 'Commercial',
  };

  const modalityAvailability: Record<string, string | undefined> = {
    venda: 'https://schema.org/InStock',
    aluguel: 'https://schema.org/InStock',
    lancamento: 'https://schema.org/PreOrder',
  };

  return {
    '@context': 'https://schema.org',
    '@type': typeMap[property.type ?? 'apartamento'],
    name: property.title,
    description: `Imóvel em ${property.city}/${property.state} - ${
      property.modality ?? 'venda'
    }.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.state,
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'BRL',
      availability: modalityAvailability[property.modality ?? 'venda'],
      ...(property.url ? { url: property.url } : {}),
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
  };
}

export function buildItemListSchema(
  items: Array<{ id: string; title: string; url?: string }>,
): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...(item.url ? { url: item.url } : {}),
      name: item.title,
    })),
  };
}

export function buildBreadcrumbSchema(
  crumbs: Array<{ name: string; item?: string }>,
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.item ? { item: crumb.item } : {}),
    })),
  };
}

export type OrganizationSchema = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType?: string;
    email?: string;
  };
};

export type WebSiteSchema = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url?: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
};

export function buildOrganizationSchema(org: {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    street?: string;
  };
  contact?: {
    phone?: string;
    type?: string;
    email?: string;
  };
}): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    ...(org.url ? { url: org.url } : {}),
    ...(org.logo ? { logo: org.logo } : {}),
    ...(org.description ? { description: org.description } : {}),
    ...(Array.isArray(org.sameAs) && org.sameAs.length ? { sameAs: org.sameAs } : {}),
    ...(org.address
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: org.address.city,
            addressRegion: org.address.state,
            addressCountry: org.address.country,
            postalCode: org.address.postalCode,
            streetAddress: org.address.street,
          },
        }
      : {}),
    ...(org.contact
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: org.contact.phone,
            contactType: org.contact.type,
            email: org.contact.email,
          },
        }
      : {}),
  };
}

export function buildWebSiteSchema(site: {
  name: string;
  url?: string;
  description?: string;
  searchUrlTemplate?: string;
}): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    ...(site.url ? { url: site.url } : {}),
    ...(site.description ? { description: site.description } : {}),
    ...(site.searchUrlTemplate
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: site.searchUrlTemplate,
            },
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  };
}
