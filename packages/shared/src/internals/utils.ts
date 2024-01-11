import type {
  ExpandedRouteConfig,
  FileData,
  FileRouterInputConfig,
  FileRouterInputKey,
  FileSize,
  RequestLike,
  ResponseEsque,
} from "./types";

export function isRouteArray(
  routeConfig: FileRouterInputConfig
): routeConfig is FileRouterInputKey[] {
  return Array.isArray(routeConfig);
}

export function getDefaultSizeForType(fileType: FileRouterInputKey): FileSize {
  if (fileType === "image") return "4MB";
  if (fileType === "video") return "16MB";
  if (fileType === "audio") return "8MB";
  if (fileType === "blob") return "8MB";
  if (fileType === "pdf") return "4MB";
  if (fileType === "text") return "64KB";

  return "4MB";
}

/**
 * This function takes in the user's input and "upscales" it to a full config
 *
 * Example:
 * ```ts
 * ["image"] => { image: { maxFileSize: "4MB", limit: 1 } }
 * ```
 */
export function fillInputRouteConfig(
  routeConfig: FileRouterInputConfig
): ExpandedRouteConfig {
  // If array, apply defaults
  if (isRouteArray(routeConfig)) {
    return routeConfig.reduce<ExpandedRouteConfig>((acc, fileType) => {
      acc[fileType] = {
        // Apply defaults
        maxFileSize: getDefaultSizeForType(fileType),
        maxFileCount: 1,
        contentDisposition: "inline",
      };
      return acc;
    }, {});
  }

  // Backfill defaults onto config
  const newConfig: ExpandedRouteConfig = {};
  const inputKeys = objectKeys(routeConfig);
  inputKeys.forEach((key) => {
    const value = routeConfig[key];
    if (!value) throw new Error("Invalid config during fill");

    const defaultValues = {
      maxFileSize: getDefaultSizeForType(key),
      maxFileCount: 1,
      contentDisposition: "inline" as const,
    };

    newConfig[key] = { ...defaultValues, ...value };
  }, {} as ExpandedRouteConfig);

  return newConfig;
}

export function getTypeFromFileName(
  fileName: string,
  allowedTypes: FileRouterInputKey[]
) {
  return "image/png";
}

export function generateUploadThingURL(path: `/${string}`) {
  let host = "https://uploadthing.com";
  return host + path;
}

/**
 * RETURN UNDEFINED TO KEEP GOING
 * SO MAKE SURE YOUR FUNCTION RETURNS SOMETHING
 * OTHERWISE IT'S AN IMPLICIT UNDEFINED AND WILL CAUSE
 * AN INFINITE LOOP
 */
export const withExponentialBackoff = async <T>(
  doTheThing: () => Promise<T | undefined>,
  MAXIMUM_BACKOFF_MS = 64 * 1000,
  MAX_RETRIES = 20
): Promise<T | null> => {
  return null;
};

export async function pollForFileData(
  opts: {
    url: string;
    // no apikey => no filedata will be returned, just status
    apiKey: string | null;
    sdkVersion: string;
  },
  callback?: (json: any) => Promise<any>
) {
  return null;
}

export const FILESIZE_UNITS = ["B", "KB", "MB", "GB"] as const;
export type FileSizeUnit = (typeof FILESIZE_UNITS)[number];
export const fileSizeToBytes = (input: string) => {
  return 1;
};

export async function safeParseJSON<T>(
  input: string | ResponseEsque | RequestLike
): Promise<T | Error> {
  return new Error("Not implemented");
}

/** typesafe Object.keys */
export function objectKeys<T extends Record<string, unknown>>(
  obj: T
): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/** checks if obj is a valid, non-null object */
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
