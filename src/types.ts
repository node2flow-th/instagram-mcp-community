/**
 * Instagram Graph API Types
 */

export interface InstagramConfig {
  accessToken: string;
  accountId?: string;
}

export interface InstagramAccount {
  id: string;
  username?: string;
  name?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  profile_picture_url?: string;
  website?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  children?: { data: InstagramMedia[] };
}

export interface InstagramComment {
  id: string;
  text: string;
  username?: string;
  timestamp?: string;
  like_count?: number;
  hidden?: boolean;
  replies?: { data: InstagramComment[] };
}

export interface InstagramStory {
  id: string;
  media_type?: 'IMAGE' | 'VIDEO';
  media_url?: string;
  timestamp?: string;
}

export interface InstagramInsight {
  name: string;
  period: string;
  values: Array<{ value: number | Record<string, number>; end_time?: string }>;
  title: string;
  description: string;
}

export interface InstagramHashtag {
  id: string;
  name?: string;
}

export interface InstagramContainer {
  id: string;
  status?: string;
  status_code?: string;
}
