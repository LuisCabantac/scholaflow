import { queryOptions } from "@tanstack/react-query";

import {
  getAllCommentsByStreamIdFn,
  getAllPrivateCommentsByStreamIdFn,
} from "@/server/functions/comment";

export const commentKeys = {
  all: ["comment"] as const,
  byStream: (streamId: string) =>
    [...commentKeys.all, "byStream", streamId] as const,
  privateByStream: (streamId: string) =>
    [...commentKeys.all, "privateByStream", streamId] as const,
};

export const commentQueries = {
  byStream: (streamId: string) =>
    queryOptions({
      queryKey: commentKeys.byStream(streamId),
      queryFn: () => getAllCommentsByStreamIdFn({ data: streamId }),
    }),
  privateByStream: (streamId: string) =>
    queryOptions({
      queryKey: commentKeys.privateByStream(streamId),
      queryFn: () => getAllPrivateCommentsByStreamIdFn({ data: streamId }),
    }),
};
