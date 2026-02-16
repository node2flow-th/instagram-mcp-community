/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { InstagramClient } from './client.js';
import { TOOLS } from './tools.js';

export interface InstagramMcpConfig {
  accessToken: string;
  accountId?: string;
}

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: InstagramClient
) {
  switch (toolName) {
    // ========== Account ==========
    case 'ig_get_account':
      return client.getAccount(args.account_id as string, args.fields as string | undefined);
    case 'ig_get_account_insights':
      return client.getAccountInsights(args.account_id as string, args.metric as string, args.period as string | undefined, args.since as string | undefined, args.until as string | undefined);
    case 'ig_list_media':
      return client.listMedia(args.account_id as string, args.limit as number | undefined, args.fields as string | undefined);

    // ========== Publishing ==========
    case 'ig_publish_photo':
      return client.publishPhoto(args.account_id as string, args.image_url as string, args.caption as string | undefined);
    case 'ig_publish_carousel':
      return client.publishCarousel(args.account_id as string, args.media_urls as string[], args.caption as string | undefined);
    case 'ig_publish_reel':
      return client.publishReel(args.account_id as string, args.video_url as string, args.caption as string | undefined, args.cover_url as string | undefined, args.share_to_feed as boolean | undefined);
    case 'ig_publish_story':
      return client.publishStory(args.account_id as string, args.media_url as string, (args.media_type as 'IMAGE' | 'VIDEO') || 'IMAGE');

    // ========== Media ==========
    case 'ig_get_media':
      return client.getMedia(args.media_id as string, args.fields as string | undefined);
    case 'ig_get_media_insights':
      return client.getMediaInsights(args.media_id as string, args.metric as string);
    case 'ig_get_children':
      return client.getChildren(args.media_id as string);

    // ========== Comments ==========
    case 'ig_list_comments':
      return client.listComments(args.media_id as string, args.limit as number | undefined);
    case 'ig_get_comment':
      return client.getComment(args.comment_id as string);
    case 'ig_reply_comment':
      return client.replyComment(args.comment_id as string, args.message as string);
    case 'ig_delete_comment':
      return client.deleteComment(args.comment_id as string);
    case 'ig_hide_comment':
      return client.hideComment(args.comment_id as string, args.hide as boolean);

    case 'ig_list_replies':
      return client.listReplies(args.comment_id as string, args.limit as number | undefined);

    // ========== Discovery ==========
    case 'ig_discover_user':
      return client.discoverUser(args.account_id as string, args.username as string, args.fields as string | undefined);

    // ========== Content Publishing Limit ==========
    case 'ig_get_content_publishing_limit':
      return client.getContentPublishingLimit(args.account_id as string);

    // ========== Stories ==========
    case 'ig_list_stories':
      return client.listStories(args.account_id as string);
    case 'ig_get_story_insights':
      return client.getStoryInsights(args.story_id as string, args.metric as string);

    // ========== Hashtags ==========
    case 'ig_search_hashtag':
      return client.searchHashtag(args.account_id as string, args.query as string);
    case 'ig_get_hashtag_recent':
      return client.getHashtagRecent(args.hashtag_id as string, args.account_id as string, args.fields as string | undefined);
    case 'ig_get_hashtag_top':
      return client.getHashtagTop(args.hashtag_id as string, args.account_id as string, args.fields as string | undefined);

    // ========== Mentions ==========
    case 'ig_list_tags':
      return client.listTags(args.account_id as string, args.limit as number | undefined);
    case 'ig_get_mentioned_media':
      return client.getMentionedMedia(args.account_id as string, args.media_id as string);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: InstagramMcpConfig) {
  const server = new McpServer({
    name: 'instagram-mcp',
    version: '1.0.0',
  });

  let client: InstagramClient | null = null;

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        const accessToken =
          config?.accessToken ||
          (args as Record<string, unknown>).INSTAGRAM_ACCESS_TOKEN as string;

        if (!accessToken) {
          return {
            content: [{ type: 'text' as const, text: 'Error: INSTAGRAM_ACCESS_TOKEN is required' }],
            isError: true,
          };
        }

        if (!client || config?.accessToken !== accessToken) {
          client = new InstagramClient({ accessToken, accountId: config?.accountId });
        }

        try {
          const result = await handleToolCall(tool.name, args, client);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // Prompts
  server.prompt(
    'content-publishing',
    'Guide for publishing photos, carousels, reels, and stories to Instagram',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are an Instagram content publishing assistant.',
            '',
            'Publishing tools:',
            '1. **Photo** — ig_publish_photo (image URL + caption)',
            '2. **Carousel** — ig_publish_carousel (2-10 media URLs + caption)',
            '3. **Reel** — ig_publish_reel (video URL + caption, optional cover)',
            '4. **Story** — ig_publish_story (image/video URL, disappears in 24h)',
            '',
            'Tips:',
            '- Images: JPEG recommended, max 8MB',
            '- Videos: MP4, max 15 min, max 1GB',
            '- Captions: max 2200 chars, up to 30 hashtags',
            '- All media URLs must be publicly accessible',
            '- Publishing is 2-step (create container → publish) but handled automatically',
          ].join('\n'),
        },
      }],
    }),
  );

  server.prompt(
    'analytics-guide',
    'Guide for viewing Instagram account and media insights',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are an Instagram analytics assistant.',
            '',
            'Account metrics (ig_get_account_insights):',
            '- impressions, reach, follower_count, profile_views',
            '- email_contacts, phone_call_clicks, website_clicks',
            '- Period: day, week, days_28, lifetime',
            '',
            'Media metrics (ig_get_media_insights):',
            '- Image/Carousel: impressions, reach, engagement, saved',
            '- Reel/Video: plays, reach, total_interactions, saved',
            '',
            'Story metrics (ig_get_story_insights):',
            '- impressions, reach, replies, taps_forward, taps_back, exits',
            '',
            'Hashtag research:',
            '1. ig_search_hashtag → get hashtag ID',
            '2. ig_get_hashtag_top → most popular posts',
            '3. ig_get_hashtag_recent → latest posts (24h)',
          ].join('\n'),
        },
      }],
    }),
  );

  // Resource
  server.resource(
    'server-info',
    'instagram://server-info',
    {
      description: 'Connection status and available tools for this Instagram MCP server',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'instagram://server-info',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'instagram-mcp',
          version: '1.0.0',
          connected: !!config,
          tools_available: TOOLS.length,
          tool_categories: {
            account: 3,
            publishing: 4,
            media: 3,
            comments: 6,
            stories: 2,
            discovery: 1,
            content_publishing_limit: 1,
            hashtags: 3,
            mentions: 2,
          },
          api: 'Instagram Graph API v22.0 (via Facebook Graph API)',
        }, null, 2),
      }],
    }),
  );

  // Override tools/list for raw JSON Schema
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  return server;
}
