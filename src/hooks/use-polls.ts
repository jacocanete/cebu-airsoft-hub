import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PostDetail } from "@/types";

interface PollVoteResponse {
  pollId: string;
  userVotes: string[];
  options: Array<{ id: string; text: string; votes: number }>;
}

/**
 * Votes on a poll. Replaces the user's existing votes atomically.
 * Optimistically updates the post detail cache, then confirms with the
 * server response.
 */
export function usePollVote(postId: string, pollId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (optionIds: string[]) =>
      api.post<PollVoteResponse>(
        `/api/posts/${postId}/polls/${pollId}/vote`,
        { optionIds },
      ),

    onMutate: async (optionIds) => {
      // Cancel any in-flight refetches of this post's detail
      await qc.cancelQueries({ queryKey: ["posts", postId] });

      const prev = qc.getQueryData<PostDetail>(["posts", postId]);

      if (prev?.poll) {
        qc.setQueryData<PostDetail>(["posts", postId], {
          ...prev,
          poll: {
            ...prev.poll,
            userVotes: optionIds,
          } as PostDetail["poll"],
        });
      }

      return { prev };
    },

    onSuccess: (data) => {
      // Overwrite with authoritative server counts
      qc.setQueryData<PostDetail>(["posts", postId], (prev) => {
        if (!prev?.poll) return prev;
        return {
          ...prev,
          poll: {
            ...prev.poll,
            userVotes: data.userVotes,
            options: prev.poll.options.map((o) => {
              const updated = data.options.find((u) => u.id === o.id);
              return updated ? { ...o, _count: { votes: updated.votes }, votes: updated.votes } : o;
            }),
          } as PostDetail["poll"],
        };
      });
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["posts", postId], ctx.prev);
      }
    },
  });
}
