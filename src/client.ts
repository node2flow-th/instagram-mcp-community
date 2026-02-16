/**
 * Instagram Graph API Client
 * Auth via Access Token in query param: ?access_token=xxx
 * Base URL: https://graph.facebook.com/v22.0/ (Instagram uses Facebook Graph API)
 *
 * Publishing flow (2-step):
 *   1. Create container: POST /{ig-user-id}/media → container_id
 *   2. Publish container: POST /{ig-user-id}/media_publish → media_id
 */

import type {
  InstagramConfig,
  InstagramAccount,
  InstagramMedia,
  InstagramComment,
  InstagramStory,
  InstagramInsight,
  InstagramHashtag,
  InstagramContainer,
} from './types.js';

interface GraphApiResponse<T = unknown> {
  data?: T[];
  paging?: { cursors?: { before: string; after: string }; next?: string };
  error?: { message: string; type: string; code: number };
  id?: string;
}

export class InstagramClient {
  private config: InstagramConfig;
  private baseUrl = 'https://graph.facebook.com/v22.0';

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    method: string = 'GET',
    body?: Record<string, unknown>,
    extraParams?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set('access_token', this.config.accessToken);
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
    }

    const options: RequestInit = { method };
    if (body && (method === 'POST' || method === 'DELETE')) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json() as T & { error?: { message: string; code: number } };

    if ((data as any).error) {
      throw new Error(`Instagram API Error (${(data as any).error.code}): ${(data as any).error.message}`);
    }

    return data;
  }

  // ========== Account (3) ==========

  async getAccount(accountId: string, fields?: string): Promise<InstagramAccount> {
    const params: Record<string, string> = {};
    params.fields = fields || 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website';
    return this.request<InstagramAccount>(accountId, 'GET', undefined, params);
  }

  async getAccountInsights(accountId: string, metric: string, period?: string, since?: string, until?: string): Promise<InstagramInsight[]> {
    const params: Record<string, string> = {
      metric,
      period: period || 'day',
    };
    if (since) params.since = since;
    if (until) params.until = until;
    const res = await this.request<GraphApiResponse<InstagramInsight>>(`${accountId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  async listMedia(accountId: string, limit?: number, fields?: string): Promise<InstagramMedia[]> {
    const params: Record<string, string> = {};
    params.fields = fields || 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<InstagramMedia>>(`${accountId}/media`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Publishing (4) ==========

  async publishPhoto(accountId: string, imageUrl: string, caption?: string): Promise<{ id: string }> {
    // Step 1: Create container
    const container = await this.request<{ id: string }>(`${accountId}/media`, 'POST', {
      image_url: imageUrl,
      caption: caption || '',
    });
    // Step 2: Publish
    return this.request<{ id: string }>(`${accountId}/media_publish`, 'POST', {
      creation_id: container.id,
    });
  }

  async publishCarousel(accountId: string, mediaUrls: string[], caption?: string): Promise<{ id: string }> {
    // Step 1: Create child containers
    const childIds: string[] = [];
    for (const url of mediaUrls) {
      const isVideo = /\.(mp4|mov|avi|wmv)$/i.test(url);
      const body: Record<string, unknown> = {
        is_carousel_item: true,
        ...(isVideo ? { video_url: url, media_type: 'VIDEO' } : { image_url: url }),
      };
      const child = await this.request<{ id: string }>(`${accountId}/media`, 'POST', body);
      childIds.push(child.id);
    }
    // Step 2: Create carousel container
    const container = await this.request<{ id: string }>(`${accountId}/media`, 'POST', {
      media_type: 'CAROUSEL',
      children: childIds,
      caption: caption || '',
    });
    // Step 3: Publish
    return this.request<{ id: string }>(`${accountId}/media_publish`, 'POST', {
      creation_id: container.id,
    });
  }

  async publishReel(accountId: string, videoUrl: string, caption?: string, coverUrl?: string, shareToFeed?: boolean): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      video_url: videoUrl,
      media_type: 'REELS',
      caption: caption || '',
    };
    if (coverUrl) body.cover_url = coverUrl;
    if (shareToFeed !== undefined) body.share_to_feed = shareToFeed;
    // Step 1: Create container
    const container = await this.request<{ id: string }>(`${accountId}/media`, 'POST', body);
    // Step 2: Publish
    return this.request<{ id: string }>(`${accountId}/media_publish`, 'POST', {
      creation_id: container.id,
    });
  }

  async publishStory(accountId: string, mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'): Promise<{ id: string }> {
    const body: Record<string, unknown> = { media_type: 'STORIES' };
    if (mediaType === 'VIDEO') {
      body.video_url = mediaUrl;
    } else {
      body.image_url = mediaUrl;
    }
    const container = await this.request<{ id: string }>(`${accountId}/media`, 'POST', body);
    return this.request<{ id: string }>(`${accountId}/media_publish`, 'POST', {
      creation_id: container.id,
    });
  }

  // ========== Media (3) ==========

  async getMedia(mediaId: string, fields?: string): Promise<InstagramMedia> {
    const params: Record<string, string> = {};
    params.fields = fields || 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    return this.request<InstagramMedia>(mediaId, 'GET', undefined, params);
  }

  async getMediaInsights(mediaId: string, metric: string): Promise<InstagramInsight[]> {
    const params: Record<string, string> = { metric };
    const res = await this.request<GraphApiResponse<InstagramInsight>>(`${mediaId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  async getChildren(mediaId: string): Promise<InstagramMedia[]> {
    const params: Record<string, string> = { fields: 'id,media_type,media_url,timestamp' };
    const res = await this.request<GraphApiResponse<InstagramMedia>>(`${mediaId}/children`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Comments (6) ==========

  async listComments(mediaId: string, limit?: number): Promise<InstagramComment[]> {
    const params: Record<string, string> = { fields: 'id,text,username,timestamp,like_count,hidden' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<InstagramComment>>(`${mediaId}/comments`, 'GET', undefined, params);
    return res.data || [];
  }

  async getComment(commentId: string): Promise<InstagramComment> {
    const params: Record<string, string> = { fields: 'id,text,username,timestamp,like_count,hidden,replies{id,text,username,timestamp}' };
    return this.request<InstagramComment>(commentId, 'GET', undefined, params);
  }

  async replyComment(commentId: string, message: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`${commentId}/replies`, 'POST', { message });
  }

  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(commentId, 'DELETE');
  }

  async hideComment(commentId: string, hide: boolean): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(commentId, 'POST', { hide });
  }

  async listReplies(commentId: string, limit?: number): Promise<InstagramComment[]> {
    const params: Record<string, string> = { fields: 'id,text,username,timestamp,like_count' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<InstagramComment>>(`${commentId}/replies`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Discovery (1) ==========

  async discoverUser(accountId: string, username: string, fields?: string): Promise<Record<string, unknown>> {
    const discoveryFields = fields || 'username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website';
    const params: Record<string, string> = {
      fields: `business_discovery.fields(${discoveryFields}){username}`,
    };
    // Business Discovery endpoint: GET /{account_id}?fields=business_discovery.fields(...)
    const fullFields = `business_discovery.fields(${discoveryFields})`;
    return this.request<Record<string, unknown>>(accountId, 'GET', undefined, { fields: fullFields, username });
  }

  // ========== Content Publishing Limit (1) ==========

  async getContentPublishingLimit(accountId: string): Promise<Record<string, unknown>> {
    const params: Record<string, string> = { fields: 'config,quota_usage' };
    return this.request<Record<string, unknown>>(`${accountId}/content_publishing_limit`, 'GET', undefined, params);
  }

  // ========== Stories (2) ==========

  async listStories(accountId: string): Promise<InstagramStory[]> {
    const params: Record<string, string> = { fields: 'id,media_type,media_url,timestamp' };
    const res = await this.request<GraphApiResponse<InstagramStory>>(`${accountId}/stories`, 'GET', undefined, params);
    return res.data || [];
  }

  async getStoryInsights(storyId: string, metric: string): Promise<InstagramInsight[]> {
    const params: Record<string, string> = { metric };
    const res = await this.request<GraphApiResponse<InstagramInsight>>(`${storyId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Hashtags (3) ==========

  async searchHashtag(accountId: string, query: string): Promise<InstagramHashtag[]> {
    const params: Record<string, string> = { user_id: accountId, q: query };
    const res = await this.request<GraphApiResponse<InstagramHashtag>>('ig_hashtag_search', 'GET', undefined, params);
    return res.data || [];
  }

  async getHashtagRecent(hashtagId: string, accountId: string, fields?: string): Promise<InstagramMedia[]> {
    const params: Record<string, string> = {
      user_id: accountId,
      fields: fields || 'id,caption,media_type,permalink,timestamp,like_count,comments_count',
    };
    const res = await this.request<GraphApiResponse<InstagramMedia>>(`${hashtagId}/recent_media`, 'GET', undefined, params);
    return res.data || [];
  }

  async getHashtagTop(hashtagId: string, accountId: string, fields?: string): Promise<InstagramMedia[]> {
    const params: Record<string, string> = {
      user_id: accountId,
      fields: fields || 'id,caption,media_type,permalink,timestamp,like_count,comments_count',
    };
    const res = await this.request<GraphApiResponse<InstagramMedia>>(`${hashtagId}/top_media`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Mentions (2) ==========

  async listTags(accountId: string, limit?: number): Promise<InstagramMedia[]> {
    const params: Record<string, string> = { fields: 'id,caption,media_type,permalink,timestamp' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<InstagramMedia>>(`${accountId}/tags`, 'GET', undefined, params);
    return res.data || [];
  }

  async getMentionedMedia(accountId: string, mediaId: string): Promise<InstagramMedia> {
    const params: Record<string, string> = {
      fields: 'id,caption,media_type,permalink,timestamp,like_count,comments_count',
      mentioned_media_id: mediaId,
    };
    return this.request<InstagramMedia>(`${accountId}/mentioned_media`, 'GET', undefined, params);
  }
}
