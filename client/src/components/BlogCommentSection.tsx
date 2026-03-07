import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle, Send, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BlogCommentSectionProps {
  articleId: string;
}

export default function BlogCommentSection({ articleId }: BlogCommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  const { data: comments = [], refetch: refetchComments, isLoading } = trpc.blog.getComments.useQuery(
    { articleId },
    { enabled: !!articleId }
  );

  // Fetch comment count
  const { data: commentCountData } = trpc.blog.getCommentCount.useQuery(
    { articleId },
    { enabled: !!articleId }
  );

  // Create comment mutation
  const createCommentMutation = trpc.blog.createComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      toast.success("Comment posted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = trpc.blog.deleteComment.useMutation({
    onSuccess: () => {
      refetchComments();
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to post a comment");
      return;
    }

    if (commentText.trim().length === 0) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommentMutation.mutateAsync({
        articleId,
        content: commentText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-border">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          Comments ({commentCountData?.count || 0})
        </h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card className="p-6 mb-8 border border-border">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Share your thoughts
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a thoughtful comment..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {commentText.length}/5000 characters
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCommentText("")}
                disabled={isSubmitting}
              >
                Clear
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                disabled={isSubmitting || commentText.trim().length === 0}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 mb-8 border border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <p className="text-foreground">
              <a href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </a>
              {" "}to post a comment
            </p>
          </div>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className="p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {comment.id % 10}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">User #{comment.userId}</p>
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
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
