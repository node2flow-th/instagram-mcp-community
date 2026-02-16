# @node2flow/instagram-mcp

[![npm version](https://img.shields.io/npm/v/@node2flow/instagram-mcp)](https://www.npmjs.com/package/@node2flow/instagram-mcp)
[![Smithery](https://smithery.ai/badge/@node2flow/instagram-mcp)](https://smithery.ai/server/node2flow/instagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for Instagram Graph API — publish photos, reels, carousels, and stories, manage comments, view insights, and search hashtags through 25 tools.

## Quick Start

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "instagram": {
      "command": "npx",
      "args": ["-y", "@node2flow/instagram-mcp"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your_access_token",
        "INSTAGRAM_ACCOUNT_ID": "your_ig_business_account_id"
      }
    }
  }
}
```

### Streamable HTTP (for n8n, custom clients)

```bash
INSTAGRAM_ACCESS_TOKEN=xxx npx @node2flow/instagram-mcp --http
# Server starts on http://localhost:3000/mcp
```

### Docker

```bash
docker compose up -d
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | Yes | Facebook/Instagram User Access Token with instagram_* permissions |
| `INSTAGRAM_ACCOUNT_ID` | No | Instagram Business Account ID (find via Facebook Page settings) |

### Getting an Access Token

1. Go to [Meta for Developers > Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app, request these permissions:
   - `instagram_basic` — Read profile and media
   - `instagram_content_publish` — Publish media
   - `instagram_manage_comments` — Manage comments
   - `instagram_manage_insights` — Read insights
   - `pages_show_list`, `pages_read_engagement`
3. Generate a **User Access Token** and exchange for a long-lived token

### Finding Your Instagram Account ID

```
GET /me/accounts?fields=instagram_business_account
```
The `instagram_business_account.id` is your Instagram Account ID.

## 25 Tools

| Category | Tools | Description |
|----------|-------|-------------|
| **Account** (3) | `ig_get_account`, `ig_get_account_insights`, `ig_list_media` | Profile info, analytics, media list |
| **Publishing** (4) | `ig_publish_photo`, `ig_publish_carousel`, `ig_publish_reel`, `ig_publish_story` | Create posts, reels, carousels, stories |
| **Media** (3) | `ig_get_media`, `ig_get_media_insights`, `ig_get_children` | Media details, analytics, carousel items |
| **Comments** (6) | `ig_list_comments`, `ig_get_comment`, `ig_reply_comment`, `ig_delete_comment`, `ig_hide_comment`, `ig_list_replies` | Comment management + moderation + replies |
| **Discovery** (1) | `ig_discover_user` | Look up other Business/Creator accounts |
| **Limit** (1) | `ig_get_content_publishing_limit` | Check publishing rate limit (50/day) |
| **Stories** (2) | `ig_list_stories`, `ig_get_story_insights` | Active stories + analytics |
| **Hashtags** (3) | `ig_search_hashtag`, `ig_get_hashtag_recent`, `ig_get_hashtag_top` | Hashtag research + discovery |
| **Mentions** (2) | `ig_list_tags`, `ig_get_mentioned_media` | Tagged and mentioned media |

## Prompts

| Prompt | Description |
|--------|-------------|
| `content-publishing` | Guide for publishing photos, reels, carousels, and stories |
| `analytics-guide` | Guide for viewing account and media insights |

## License & Links

- **License**: [MIT](./LICENSE)
- **npm**: [@node2flow/instagram-mcp](https://www.npmjs.com/package/@node2flow/instagram-mcp)
- **GitHub**: [node2flow-th/instagram-mcp-community](https://github.com/node2flow-th/instagram-mcp-community)
- **Smithery**: [node2flow/instagram](https://smithery.ai/server/node2flow/instagram)
