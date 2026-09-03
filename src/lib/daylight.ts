/**
 * Is the sun up at a given place and instant?
 *
 * Used to pick the daytime or night-time variant of a photograph, so it only
 * has to be right to within a few minutes — the NOAA "low precision" solar
 * position equations are good to about ±1 minute at Toronto's latitude, which
 * is far tighter than the page's revalidate window.
 *
 * Deliberately computed from the UTC instant and a longitude rather than from
 * a local wall clock: there is no timezone database lookup, no DST edge case,
 * and the same function works for any city we add later.
 *
 * Fixed hours were the alternative and are wrong for a third of the year — a
 * 7 a.m.–7 p.m. window shows a sunlit skyline at 6.30 p.m. in December, when
 * Toronto has been dark for an hour and a half.
 *
 * Reference: NOAA Global Monitoring Laboratory, Solar Calculation Details.
 */

const RAD = Math.PI / 180;

/** Where a place is, for the solar maths. */
export type Coordinates = {
  /** degrees north of the equator; negative south */
  latitude: number;
  /** degrees east of Greenwich; negative west */
  longitude: number;
};

/** Downtown Toronto — Nathan Phillips Square. */
export const TORONTO: Coordinates = {
  latitude: 43.6532,
  longitude: -79.3832,
};

/**
 * The sun's angle above the horizon, in degrees, at `instant`. Negative means
 * below the horizon: roughly -0.833° at the moment of sunrise or sunset (the
 * sun's disc is still partly visible), and down to -6° through civil twilight.
 */
export function solarElevation(instant: Date, at: Coordinates): number {
  const utcMs = instant.getTime();
  const startOfYear = Date.UTC(instant.getUTCFullYear(), 0, 1);
  /** 0-based day of the year, plus the fraction elapsed */
  const dayFraction = (utcMs - startOfYear) / 86_400_000;

  // Fractional year, in radians.
  const y = ((2 * Math.PI) / 365) * dayFraction;

  // The equation of time, in minutes: how far true solar time runs ahead of
  // mean solar time on this date.
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(y) -
      0.032077 * Math.sin(y) -
      0.014615 * Math.cos(2 * y) -
      0.040849 * Math.sin(2 * y));

  // Solar declination, in radians: how far north or south the sun sits.
  const decl =
    0.006918 -
    0.399912 * Math.cos(y) +
    0.070257 * Math.sin(y) -
    0.006758 * Math.cos(2 * y) +
    0.000907 * Math.sin(2 * y) -
    0.002697 * Math.cos(3 * y) +
    0.001480 * Math.sin(3 * y);

  // True solar time at this longitude, in minutes past local solar midnight.
  const utcMinutes =
    instant.getUTCHours() * 60 +
    instant.getUTCMinutes() +
    instant.getUTCSeconds() / 60;
  const trueSolarMinutes = utcMinutes + eqTime + 4 * at.longitude;

  // Hour angle: 0° at solar noon, ±180° at solar midnight.
  const hourAngle = trueSolarMinutes / 4 - 180;

  const lat = at.latitude * RAD;
  const cosZenith =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle * RAD);

  // Clamped because rounding can push it a hair outside [-1, 1] at the poles.
  return 90 - Math.acos(Math.min(1, Math.max(-1, cosZenith))) / RAD;
}

/**
 * True while the sun is above the horizon — the switch between a daylight and
 * a night-time photograph.
 *
 * The threshold is the standard -0.833°, which accounts for the sun's radius
 * and atmospheric refraction, so this flips at published sunrise and sunset
 * times rather than a few minutes off them. Civil twilight is treated as
 * night: the night photograph is a blue-hour shot, which is what the sky
 * actually looks like then.
 */
export function isDaylight(instant: Date, at: Coordinates = TORONTO): boolean {
  return solarElevation(instant, at) > -0.833;
}
