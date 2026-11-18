/**
 * RASHX Content Type System
 *
 * Shared types for all structured content.
 * Content modules must NOT import from UI packages.
 */

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface LocalizedRichText {
  ar: string;
  en: string;
}

export interface ImageAsset {
  src: string;
  alt: LocalizedString;
  width?: number;
  height?: number;
  priority?: boolean;
}

export interface SEOMeta {
  title: LocalizedString;
  description: LocalizedString;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface ContentPage {
  slug: string;
  meta: SEOMeta;
  publishedAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: LocalizedString;
  title: LocalizedString;
  bio: LocalizedRichText;
  image?: ImageAsset;
  linkedIn?: string;
  twitter?: string;
}

export interface Milestone {
  id: string;
  date: string;
  title: LocalizedString;
  description: LocalizedRichText;
}

export interface NavLink {
  href: string;
  label: LocalizedString;
  external?: boolean;
  badge?: LocalizedString;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'github';
  url: string;
  label: LocalizedString;
}
