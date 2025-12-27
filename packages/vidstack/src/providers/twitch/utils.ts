import type { VideoQuality } from '../../core/quality/video-quality';
import type { TwitchQuality } from './embed/event';

/**
 * Matches channel names:
 * https://www.twitch.tv/example
 * https://player.twitch.tv/?channel=example
 * twitch/example
 * -> match group is "example"
 * (Specifically excludes twitch.tv/video and twitch.tv/videos, sorry if someone wants to embed those channels)
 */
const channelNameRE = /(?:twitch\.tv\/|player\.twitch\.tv\/\?channel=|twitch\/)(?!videos?)(\w+)$/;

/**
 * Matches video IDs:
 * https://www.twitch.tv/videos/123456789
 * https://player.twitch.tv/?video=123456789
 * twitch/video/123456789
 * -> match group is "123456789"
 */
const videoIdRE = /(?:twitch\.tv\/videos\/|player\.twitch\.tv\/\?video=|twitch\/video\/)(\d+)/;

export function resolveTwitchSource(src: string): {
  channel?: string;
  videoId?: string;
} {
  const videoIdMatch = src.match(videoIdRE);

  if (videoIdMatch) {
    return {
      videoId: videoIdMatch[1],
    };
  }

  const channelMatch = src.match(channelNameRE);

  if (channelMatch) {
    return {
      channel: channelMatch[1],
    };
  }

  return {};
}

/**
 * Convert a Twitch quality object to a native VideoQuality object.
 * @param input Twitch quality
 * @param activeQuality name (id) of the currently active quality
 * @returns Vidstack-compatible quality object
 */
export function twitchQualityToVideoQuality(
  quality: TwitchQuality,
  activeQuality?: string,
): VideoQuality {
  return {
    id: quality.name,
    width: quality.width,
    height: quality.height,
    bitrate: quality.bitrate,
    codec: quality.codecs,
    selected: activeQuality === quality.name,
  };
}

const posterCache = new Map<string, string>();
const pendingFetch = new Map<string, Promise<string>>();

/**
 * Attempts to find the highest quality poster image for a Twitch video or channel.
 * For live streams, uses the channel preview image.
 * For VODs, uses the video thumbnail.
 *
 * @param src - The original source (channel name or video ID)
 * @param isChannel - Whether this is a channel (live) or video (VOD)
 * @param abort - AbortController to cancel the fetch
 * @returns URL to the poster image, or empty string if not found
 */
export async function findTwitchPoster(
  src: string,
  isChannel: boolean,
  abort: AbortController,
): Promise<string> {
  const cacheKey = `${isChannel ? 'channel' : 'video'}-${src}`;

  if (posterCache.has(cacheKey)) return posterCache.get(cacheKey)!;
  if (pendingFetch.has(cacheKey)) return pendingFetch.get(cacheKey)!;

  const pending = new Promise<string>(async (resolve) => {
    try {
      if (isChannel) {
        // For live streams, use channel preview image
        // Format: https://static-cdn.jtvnw.net/previews-ttv/live_user_{channel}-{width}x{height}.jpg
        const sizes = [
          { width: 1920, height: 1080 },
          { width: 1280, height: 720 },
          { width: 640, height: 360 },
        ];

        for (const { width, height } of sizes) {
          const url = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${src}-${width}x${height}.jpg`;
          const response = await fetch(url, {
            mode: 'no-cors',
            signal: abort.signal,
          });

          if (response.status < 400) {
            posterCache.set(cacheKey, url);
            resolve(url);
            return;
          }
        }
      } else {
        // For VODs, use video thumbnail
        // Format: https://static-cdn.jtvnw.net/cf_vods/{video_id}/thumb/thumb0-{width}x{height}.jpg
        const sizes = [
          { width: 1920, height: 1080 },
          { width: 1280, height: 720 },
          { width: 640, height: 360 },
        ];

        for (const { width, height } of sizes) {
          const url = `https://static-cdn.jtvnw.net/cf_vods/${src}/thumb/thumb0-${width}x${height}.jpg`;
          const response = await fetch(url, {
            mode: 'no-cors',
            signal: abort.signal,
          });

          if (response.status < 400) {
            posterCache.set(cacheKey, url);
            resolve(url);
            return;
          }
        }
      }

      resolve('');
    } catch (e) {
      resolve('');
    }
  })
    .catch(() => '')
    .finally(() => pendingFetch.delete(cacheKey));

  pendingFetch.set(cacheKey, pending);
  return pending;
}
