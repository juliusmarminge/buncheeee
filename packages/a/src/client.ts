import {
  safeParseJSON,
  UploadThingError,
  withExponentialBackoff,
} from "@repo/shared";

import type {
  DistributiveOmit,
  FileRouter,
  inferEndpointInput,
  inferEndpointOutput,
} from "./internal/types";

type UploadFilesOptions<
  TRouter extends FileRouter,
  TEndpoint extends keyof TRouter
> = {
  onUploadProgress?: ({
    file,
    progress,
  }: {
    file: string;
    progress: number;
  }) => void;
  onUploadBegin?: ({ file }: { file: string }) => void;

  files: File[];

  url: URL;
} & (undefined extends inferEndpointInput<TRouter[TEndpoint]>
  ? {}
  : {
      input: inferEndpointInput<TRouter[TEndpoint]>;
    });

export const INTERNAL_DO_NOT_USE__fatalClientError = (e: Error) =>
  new UploadThingError({
    code: "INTERNAL_CLIENT_ERROR",
    message: "Something went wrong. Please report this to UploadThing.",
    cause: e,
  });

export type UploadFileResponse<TServerOutput> = {
  name: string;
  size: number;
  key: string;
  url: string;
  // Matches what's returned from the serverside `onUploadComplete` callback
  serverData: TServerOutput;
};

export const DANGEROUS__uploadFiles = async <
  TRouter extends FileRouter,
  TEndpoint extends keyof TRouter
>(
  endpoint: TEndpoint,
  opts: UploadFilesOptions<TRouter, TEndpoint>
) => {
  return { ok: true };
};

export const genUploader = <TRouter extends FileRouter>(initOpts: {
  url?: string | URL;
}) => {
  const url = initOpts?.url;

  return <TEndpoint extends keyof TRouter>(
    endpoint: TEndpoint,
    opts: DistributiveOmit<
      Parameters<typeof DANGEROUS__uploadFiles<TRouter, TEndpoint>>[1],
      "url"
    >
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    DANGEROUS__uploadFiles<TRouter, TEndpoint>(endpoint, {
      ...opts,
      url,
    } as any);
};
