import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type BlogComment = {
  id: number;
  articleId: string;
  userId: number;
  parentCommentId: number | null;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

interface NestedCommentProps {
  comment: BlogComment;
  articleId: string;
  depth?: number;
  onCommentDeleted?: () => void;
}

export default function NestedComment({
  comment,
  articleId,
  depth = 0,
  onCommentDeleted,
}: NestedCommentProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch replies for this comment
  const { data: replies = [], refetch: refetchReplies } = trpc.blog.getCommentReplies.useQuery(
    { commentId: comment.id },
    { enabled: !!comment.id }
  );

  // Create reply mutation
  const createReplyMutation = trpc.blog.createReply.useMutation({
    onSuccess: () => {
      setReplyText("");
      setShowReplyForm(false);
      refetchReplies();
      toast.success("Reply posted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post reply");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = trpc.blog.deleteComment.useMutation({
    onSuccess: () => {
      refetchReplies();
      onCommentDeleted?.();
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to post a reply");
      return;
    }

    if (replyText.trim().length === 0) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReplyMutation.mutateAsync({
        articleId,
        parentCommentId: comment.id,
        content: replyText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ commentId: comment.id });
    }
  };

  const marginLeft = Math.min(depth * 32, 128); // Max 128px indent
  const isMaxDepth = depth >= 4; // Limit nesting depth

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="space-y-3">
      <Card className="p-4 border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xs">
              {comment.id % 10}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">User #{comment.userId}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {user?.id === comment.userId && (
            <button
              onClick={handleDeleteComment}
              className="text-muted-foreground hover:text-red-500 transition-colors p-2 -mr-2"
              title="Delete comment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {comment.content}
        </p>

        {/* Reply button */}
        {!isMaxDepth && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            Reply
          </button>
        )}
      </Card>

      {/* Reply form */}
      {showReplyForm && !isMaxDepth && (
        <Card className="p-4 border border-border bg-background/50 ml-4">
          <form onSubmit={handleSubmitReply} className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                disabled={isSubmitting || replyText.trim().length === 0}
              >
                <Send className="w-3 h-3" />
                {isSubmitting ? "Posting..." : "Reply"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Nested replies */}
      {replies && replies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 mb-2"
          >
            {showReplies ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>

          {showReplies && (
            <div className="space-y-3">
              {replies.map((reply) => (
                <NestedComment
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  depth={depth + 1}
                  onCommentDeleted={refetchReplies}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
