import { isString } from 'maverick.js/std';

import type { MediaContext } from '../../core/api/media-context';
import type { Src } from '../../core/api/src-types';
import type { MediaType } from '../../core/api/types';
import { preconnect } from '../../utils/network';
import type { MediaProviderLoader } from '../types';
import type { TwitchProvider } from './provider';

export class TwitchProviderLoader implements MediaProviderLoader<TwitchProvider> {
  readonly name = 'twitch';

  target!: HTMLIFrameElement;

  preconnect() {
    const connections = [
      // TODO: these are probably not complete
      'static-cdn.jtvnw.net',
      'static.twitchcdn.net',
    ];

    for (const url of connections) {
      preconnect(url);
    }
  }

  canPlay(src: Src): boolean {
    return isString(src.src) && src.type === 'video/twitch';
  }

  mediaType(): MediaType {
    return 'video';
  }

  async load(ctx: MediaContext): Promise<TwitchProvider> {
    if (__SERVER__) {
      throw Error('[vidstack] can not load twitch provider server-side');
    }

    if (__DEV__ && !this.target) {
      throw Error(
        '[vidstack] `<iframe>` element was not found - did you forget to include media provider?',
      );
    }

    return new (await import('./provider')).TwitchProvider(this.target, ctx);
  }

  async loadPoster(src: Src, ctx: MediaContext, abort: AbortController): Promise<string | null> {
    const { findTwitchPoster, resolveTwitchSource } = await import('./utils');

    if (!isString(src.src)) return null;

    const { channel, videoId } = resolveTwitchSource(src.src);

    if (channel) {
      return findTwitchPoster(channel, true, abort);
    } else if (videoId) {
      return findTwitchPoster(videoId, false, abort);
    }

    return null;
  }
}
