/**
 * HTTP Layer Types
 */

import { Elysia } from 'elysia';

/**
 * The type a controller exposes as `routes` for composition in src/index.ts.
 *
 * Every controller builds its routes with a `prefix` (`/agenda`, `/auth`, …),
 * which makes the instance a `Elysia<"/agenda">` and friends. Elysia keeps the
 * prefix in a separate generic slot from the path, so neither a bare `Elysia`
 * nor `Elysia<string>` accepts it — only widening every slot does. Verified:
 * `Elysia` and `Elysia<string>` both fail, `Elysia<any, any, any, any, any,
 * any, any>` compiles.
 *
 * The loss of specificity is confined to this field. src/index.ts is the single
 * consumer, and composing the controllers there is where the full route types
 * are actually available and worth having.
 */
export type HttpRoutes = Elysia<any, any, any, any, any, any, any>;
