import {
  generateUploadThingURL,
  getTypeFromFileName,
  isObject,
  objectKeys,
  fillInputRouteConfig as parseAndExpandInputConfig,
  safeParseJSON,
  UploadThingError,
} from "@repo/shared";
import type {
  ContentDisposition,
  ExpandedRouteConfig,
  FileRouterInputKey,
  Json,
  RequestLike,
  UploadedFile,
} from "@repo/shared";

import { UPLOADTHING_VERSION } from "../constants";
import { VALID_ACTION_TYPES } from "./types";
import type { ActionType, FileRouter, UTEvents } from "./types";

/**
 * Creates a wrapped fetch that will always forward a few headers to the server.
 */
const createUTFetch = (apiKey: string) => {
  return async (endpoint: `/${string}`, payload: unknown) => {
    const response = await fetch(generateUploadThingURL(endpoint), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": apiKey,
        "x-uploadthing-version": UPLOADTHING_VERSION,
      },
    });

    return response;
  };
};

const fileCountLimitHit = (
  files: { name: string }[],
  routeConfig: ExpandedRouteConfig
) => {
  const counts: Record<string, number> = {};

  files.forEach((file) => {
    const type = getTypeFromFileName(file.name, objectKeys(routeConfig));

    if (!counts[type]) {
      counts[type] = 1;
    } else {
      counts[type] += 1;
    }
  });

  for (const _key in counts) {
    const key = _key as FileRouterInputKey;
    const count = counts[key];
    const limit = routeConfig[key]?.maxFileCount;

    if (!limit) {
      console.error(routeConfig, key);
      throw new UploadThingError({
        code: "BAD_REQUEST",
        message: "Invalid config during file count",
        cause: `Expected route config to have a maxFileCount for key ${key} but none was found.`,
      });
    }

    if (count > limit) {
      return { limitHit: true, type: key, limit, count };
    }
  }

  return { limitHit: false };
};

export type RouterWithConfig<TRouter extends FileRouter> = {
  router: TRouter;
  config?: {
    callbackUrl?: string;
    uploadthingId?: string;
    uploadthingSecret?: string;
  };
};

const getHeader = (req: RequestLike, key: string) => {
  if (req.headers instanceof Headers) {
    return req.headers.get(key);
  }
  return req.headers[key];
};

export type UploadThingResponse = {
  presignedUrls: string[];
  pollingJwt: string;
  key: string;
  pollingUrl: string;
  uploadId: string;
  fileName: string;
  fileType: MimeType;
  contentDisposition: ContentDisposition;
  chunkCount: number;
  chunkSize: number;
}[];

export const buildRequestHandler = <TRouter extends FileRouter>(
  opts: RouterWithConfig<TRouter>
) => {
  return async (input: {
    req: RequestLike;
    // Allow for overriding request URL since some req.url are read-only
    // If the adapter doesn't give a full url on `req.url`, this should be set
    url?: URL;
    res?: unknown;
    event?: unknown;
  }): Promise<
    UploadThingError | { status: 200; body?: UploadThingResponse }
  > => {
    return new UploadThingError({
      code: "BAD_REQUEST",
      message: `Not implemented`,
    });
  };
};

export const buildPermissionsInfoHandler = <TRouter extends FileRouter>(
  opts: RouterWithConfig<TRouter>
) => {
  return () => {
    const r = opts.router;

    const permissions = Object.keys(r).map((k) => {
      const route = r[k];
      const config = parseAndExpandInputConfig(route._def.routerConfig);
      return {
        slug: k as keyof TRouter,
        config,
      };
    });

    return permissions;
  };
};
