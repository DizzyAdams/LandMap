export type DesignAssetKind =
  | 'frame'
  | 'component'
  | 'token'
  | 'prototype'
  | 'image';

export interface DesignAsset {
  id: string;
  name: string;
  kind: DesignAssetKind;
  url?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  source: 'opendesign';
}

export interface OpenDesignConfig {
  apiKey?: string;
  baseUrl?: string;
}
