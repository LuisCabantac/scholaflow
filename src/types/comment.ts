export type CommentInput = { content: string | null; file: File | null };

export type PrivateCommentInput = CommentInput & { recipientId: string | null };
