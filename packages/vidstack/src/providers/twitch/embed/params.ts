/**
 * Twitch Player Parameters.
 *
 * These parameters are used to configure the Twitch embed player. They are passed as query
 * parameters to the iframe src URL.
 *
 * @see {@link https://dev.twitch.tv/docs/embed/video-and-clips}
 * @example
 * ```typescript
 * // Live stream
 * const params: TwitchParams = {
 *   channel: 'channelname',
 *   parent: ['yourdomain.com'],
 *   autoplay: false,
 *   muted: false
 * };
 *
 * // Video on Demand
 * const params: TwitchParams = {
 *   video: '1234567890',
 *   parent: ['yourdomain.com'],
 *   autoplay: false,
 *   muted: false,
 *   time: '1h30m45s' // Start at 1 hour, 30 minutes, 45 seconds
 * };
 * ```
 */
export interface TwitchParams {
  /**
   * Channel name for a live stream. Use this to embed a Twitch channel's live broadcast.
   *
   * Note: Use either `channel` or `video`, not both.
   *
   * @example 'xqc'
   * @example 'shroud'
   */
  channel?: string;

  /**
   * Video ID for a Video on Demand (VOD). Use this to embed a recorded Twitch video.
   *
   * Note: Use either `channel` or `video`, not both.
   *
   * @example '1234567890'
   */
  video?: string;

  /**
   * List of parent domains where the player is embedded. Required by Twitch for security.
   *
   * This parameter is required for the embed to work correctly. If the embed is on a domain
   * not listed in this array, the player will not load. Include all domains (and subdomains)
   * where you plan to embed the player.
   *
   * @example ['example.com', 'www.example.com']
   * @example ['localhost'] // For local development
   */
  parent: string[];

  /**
   * Whether the video starts playing automatically without user interaction.
   *
   * Note: On mobile devices and some browsers, autoplay may be blocked by browser policies
   * and will require user interaction to start playback.
   *
   * @defaultValue false
   */
  autoplay?: boolean;

  /**
   * Whether the video starts in a muted state.
   *
   * Note: It's recommended to set this to `true` when using `autoplay: true` to comply
   * with browser autoplay policies.
   *
   * @defaultValue false
   */
  muted?: boolean;

  /**
   * Timestamp where playback should start. Only valid for Video on Demand (VOD) content.
   *
   * Format: `{hours}h{minutes}m{seconds}s`
   * - Hours, minutes, and seconds are all optional
   * - Each component can be omitted if zero
   *
   * @defaultValue '0h0m0s'
   * @example '1h30m45s' // Start at 1 hour, 30 minutes, 45 seconds
   * @example '45s' // Start at 45 seconds
   * @example '2m30s' // Start at 2 minutes, 30 seconds
   * @example '1h' // Start at 1 hour
   */
  time?: string;
}
