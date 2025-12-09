import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { ArticleCard } from "@/components/article-card";
import { PostArticleForm } from "@/components/post-article-form";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ArticleWithAuthor } from "@shared/schema";

function ArticleSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: articles, isLoading, error } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
  });

  const postArticleMutation = useMutation({
    mutationFn: async (data: { url: string; title: string }) => {
      return apiRequest("POST", "/api/articles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article posted!",
        description: "Your article has been shared with the community.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to post article",
        description: error.message,
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article deleted",
        description: "The article has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete article",
        description: error.message,
      });
    },
  });

  const handlePostArticle = (data: { url: string; title: string }) => {
    postArticleMutation.mutate(data);
  };

  const handleDeleteArticle = (id: string) => {
    deleteArticleMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-8">
        {user && (
          <div className="mb-8">
            <PostArticleForm
              onSubmit={handlePostArticle}
              isSubmitting={postArticleMutation.isPending}
            />
          </div>
        )}

        <section>
          <h2 className="mb-6 text-xl font-semibold" data-testid="text-section-title">
            Recent Articles
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              <ArticleSkeleton />
              <ArticleSkeleton />
              <ArticleSkeleton />
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-destructive" data-testid="text-error">
                Failed to load articles. Please try again later.
              </p>
            </Card>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-4" data-testid="article-feed">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  currentUserId={user?.id}
                  isAdmin={user?.isAdmin}
                  onDelete={handleDeleteArticle}
                  isDeleting={deleteArticleMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No articles yet"
              description={
                user
                  ? "Be the first to share an interesting article with the community!"
                  : "Sign in to share articles with the community."
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}
