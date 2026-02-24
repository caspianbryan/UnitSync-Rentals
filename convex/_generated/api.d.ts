/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as maintenance from "../maintenance.js";
import type * as mutations_users from "../mutations/users.js";
import type * as paymentSubmissions from "../paymentSubmissions.js";
import type * as payments from "../payments.js";
import type * as properties from "../properties.js";
import type * as tenants from "../tenants.js";
import type * as units from "../units.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  maintenance: typeof maintenance;
  "mutations/users": typeof mutations_users;
  paymentSubmissions: typeof paymentSubmissions;
  payments: typeof payments;
  properties: typeof properties;
  tenants: typeof tenants;
  units: typeof units;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
