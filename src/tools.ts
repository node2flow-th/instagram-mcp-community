/**
 * Instagram Graph API - MCP Tool Definitions (25 tools)
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  inputSchema: Record<string, unknown>;
}

export const TOOLS: MCPToolDefinition[] = [
  // ========== Account (3) ==========
  {
    name: 'ig_get_account',
    description:
      'Get Instagram Business/Creator account info: username, name, bio, followers, following, media count, profile picture, and website.',
    annotations: { title: 'Get Account', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID. Find via Facebook Page settings or fb_list_pages + /page_id?fields=instagram_business_account' },
        fields: { type: 'string', description: 'Comma-separated fields (e.g. "username,followers_count,media_count"). Default: all basic fields.' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'ig_get_account_insights',
    description:
      'Get account-level analytics. Metrics: impressions, reach, follower_count, email_contacts, phone_call_clicks, text_message_clicks, website_clicks, profile_views. Period: day, week, days_28, lifetime.',
    annotations: { title: 'Account Insights', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        metric: { type: 'string', description: 'Comma-separated metrics (e.g. "impressions,reach,follower_count,profile_views")' },
        period: { type: 'string', description: 'Aggregation period: "day", "week", "days_28", or "lifetime" (default: day)' },
        since: { type: 'string', description: 'Start date YYYY-MM-DD or Unix timestamp' },
        until: { type: 'string', description: 'End date YYYY-MM-DD or Unix timestamp (max 30 days range)' },
      },
      required: ['account_id', 'metric'],
    },
  },
  {
    name: 'ig_list_media',
    description:
      'List media posts from an Instagram account. Returns ID, caption, type (IMAGE/VIDEO/CAROUSEL_ALBUM), URL, permalink, timestamp, likes, and comments count.',
    annotations: { title: 'List Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        limit: { type: 'number', description: 'Number of media to return (default: 25, max: 100)' },
        fields: { type: 'string', description: 'Comma-separated fields (default: id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count)' },
      },
      required: ['account_id'],
    },
  },

  // ========== Publishing (4) ==========
  {
    name: 'ig_publish_photo',
    description:
      'Publish a photo post to Instagram. Requires a public image URL. Handles the 2-step process (create container → publish) automatically.',
    annotations: { title: 'Publish Photo', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        image_url: { type: 'string', description: 'Public URL of the image (JPEG recommended, max 8MB)' },
        caption: { type: 'string', description: 'Post caption (max 2200 characters, up to 30 hashtags)' },
      },
      required: ['account_id', 'image_url'],
    },
  },
  {
    name: 'ig_publish_carousel',
    description:
      'Publish a carousel post (multiple images/videos) to Instagram. Provide 2-10 media URLs. Each item can be an image or video URL.',
    annotations: { title: 'Publish Carousel', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        media_urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of 2-10 public media URLs (images or videos). Videos auto-detected by extension (.mp4, .mov).',
        },
        caption: { type: 'string', description: 'Post caption (max 2200 characters)' },
      },
      required: ['account_id', 'media_urls'],
    },
  },
  {
    name: 'ig_publish_reel',
    description:
      'Publish a Reel (short video) to Instagram. Video must be publicly accessible. Supports cover image and share-to-feed option.',
    annotations: { title: 'Publish Reel', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        video_url: { type: 'string', description: 'Public URL of the video file (MP4, max 15 min, max 1GB)' },
        caption: { type: 'string', description: 'Reel caption (max 2200 characters)' },
        cover_url: { type: 'string', description: 'Public URL of cover image (optional)' },
        share_to_feed: { type: 'boolean', description: 'Also show in profile grid feed (default: true)' },
      },
      required: ['account_id', 'video_url'],
    },
  },
  {
    name: 'ig_publish_story',
    description:
      'Publish a Story (image or video) to Instagram. Stories disappear after 24 hours.',
    annotations: { title: 'Publish Story', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        media_url: { type: 'string', description: 'Public URL of image or video' },
        media_type: { type: 'string', description: '"IMAGE" or "VIDEO" (default: IMAGE)' },
      },
      required: ['account_id', 'media_url'],
    },
  },

  // ========== Media (3) ==========
  {
    name: 'ig_get_media',
    description:
      'Get details of a single Instagram media post: caption, type, URL, permalink, timestamp, likes, and comments count.',
    annotations: { title: 'Get Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: { type: 'string', description: 'Instagram Media ID' },
        fields: { type: 'string', description: 'Comma-separated fields to return' },
      },
      required: ['media_id'],
    },
  },
  {
    name: 'ig_get_media_insights',
    description:
      'Get analytics for a specific media post. Image/Carousel metrics: impressions, reach, engagement, saved. Video/Reel metrics: plays, reach, total_interactions, saved.',
    annotations: { title: 'Media Insights', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: { type: 'string', description: 'Instagram Media ID' },
        metric: { type: 'string', description: 'Comma-separated metrics (e.g. "impressions,reach,engagement,saved" for images or "plays,reach,total_interactions" for reels)' },
      },
      required: ['media_id', 'metric'],
    },
  },
  {
    name: 'ig_get_children',
    description:
      'Get individual items from a carousel post. Returns each child media with ID, type, and URL.',
    annotations: { title: 'Get Carousel Children', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: { type: 'string', description: 'Carousel media ID (must be CAROUSEL_ALBUM type)' },
      },
      required: ['media_id'],
    },
  },

  // ========== Comments (5) ==========
  {
    name: 'ig_list_comments',
    description:
      'List comments on an Instagram media post. Returns comment ID, text, username, timestamp, like count, and hidden status.',
    annotations: { title: 'List Comments', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        media_id: { type: 'string', description: 'Instagram Media ID to get comments from' },
        limit: { type: 'number', description: 'Number of comments to return (default: 25)' },
      },
      required: ['media_id'],
    },
  },
  {
    name: 'ig_get_comment',
    description:
      'Get a single comment with its replies. Returns comment text, author, timestamp, like count, and threaded replies.',
    annotations: { title: 'Get Comment', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Instagram Comment ID' },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'ig_reply_comment',
    description:
      'Reply to an Instagram comment. Creates a threaded reply under the comment.',
    annotations: { title: 'Reply to Comment', readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to reply to' },
        message: { type: 'string', description: 'Reply text' },
      },
      required: ['comment_id', 'message'],
    },
  },
  {
    name: 'ig_delete_comment',
    description:
      'Permanently delete a comment from an Instagram post.',
    annotations: { title: 'Delete Comment', readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to delete' },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'ig_hide_comment',
    description:
      'Hide or unhide a comment. Hidden comments are only visible to the commenter.',
    annotations: { title: 'Hide/Unhide Comment', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to hide/unhide' },
        hide: { type: 'boolean', description: 'true to hide, false to unhide' },
      },
      required: ['comment_id', 'hide'],
    },
  },

  // ========== Stories (2) ==========
  {
    name: 'ig_list_stories',
    description:
      'List currently active Stories on the account. Stories disappear after 24 hours.',
    annotations: { title: 'List Stories', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'ig_get_story_insights',
    description:
      'Get insights for a specific Story. Metrics: impressions, reach, replies, taps_forward, taps_back, exits.',
    annotations: { title: 'Story Insights', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        story_id: { type: 'string', description: 'Story media ID' },
        metric: { type: 'string', description: 'Comma-separated metrics (e.g. "impressions,reach,replies,taps_forward,taps_back,exits")' },
      },
      required: ['story_id', 'metric'],
    },
  },

  // ========== Hashtags (3) ==========
  {
    name: 'ig_search_hashtag',
    description:
      'Search for a hashtag by name and get its ID. Use the returned ID with ig_get_hashtag_recent or ig_get_hashtag_top. Limited to 30 searches per 7 days.',
    annotations: { title: 'Search Hashtag', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID (required for hashtag search)' },
        query: { type: 'string', description: 'Hashtag name without # (e.g. "travel")' },
      },
      required: ['account_id', 'query'],
    },
  },
  {
    name: 'ig_get_hashtag_recent',
    description:
      'Get recent media posts for a hashtag. Returns public posts from the last 24 hours. Use ig_search_hashtag first to get the hashtag_id.',
    annotations: { title: 'Hashtag Recent Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        hashtag_id: { type: 'string', description: 'Hashtag ID from ig_search_hashtag' },
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        fields: { type: 'string', description: 'Comma-separated fields (default: id,caption,media_type,permalink,timestamp,like_count,comments_count)' },
      },
      required: ['hashtag_id', 'account_id'],
    },
  },
  {
    name: 'ig_get_hashtag_top',
    description:
      'Get top (most popular) media posts for a hashtag. Returns the most engaged public posts. Use ig_search_hashtag first to get the hashtag_id.',
    annotations: { title: 'Hashtag Top Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        hashtag_id: { type: 'string', description: 'Hashtag ID from ig_search_hashtag' },
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        fields: { type: 'string', description: 'Comma-separated fields' },
      },
      required: ['hashtag_id', 'account_id'],
    },
  },

  // ========== Mentions (2) ==========
  {
    name: 'ig_list_tags',
    description:
      'List media posts where the account has been tagged (photo tags, not @mentions). Returns post details.',
    annotations: { title: 'List Tagged Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        limit: { type: 'number', description: 'Number of tagged media to return (default: 25)' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'ig_get_mentioned_media',
    description:
      'Get details of a media post where the account was @mentioned in a caption. Requires the mentioned_media_id from a webhook notification.',
    annotations: { title: 'Get Mentioned Media', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Instagram Business Account ID' },
        media_id: { type: 'string', description: 'Mentioned media ID (from webhook notification or mention data)' },
      },
      required: ['account_id', 'media_id'],
    },
  },
];
