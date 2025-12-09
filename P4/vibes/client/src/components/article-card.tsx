import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Trash2, Shield } from "lucide-react";
import type { ArticleWithAuthor } from "@shared/schema";

interface ArticleCardProps {
  article: ArticleWithAuthor;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ArticleCard({
  article,
  currentUserId,
  isAdmin,
  onDelete,
  isDeleting,
}: ArticleCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canDelete = currentUserId === article.authorId || isAdmin;
  const isOwnPost = currentUserId === article.authorId;

  const handleDelete = () => {
    onDelete(article.id);
    setShowDeleteDialog(false);
  };

  const truncatedUrl = article.url.length > 60 
    ? article.url.substring(0, 60) + "..." 
    : article.url;

  return (
    <>
      <Card className="group relative p-6" data-testid={`card-article-${article.id}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg font-medium hover:underline"
                data-testid={`link-article-${article.id}`}
              >
                <span className="truncate">{article.title}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </a>
              <p className="mt-1 truncate text-sm text-muted-foreground" data-testid={`text-article-url-${article.id}`}>
                {truncatedUrl}
              </p>
            </div>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                aria-label="Delete article"
                data-testid={`button-delete-${article.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Posted by</span>
            <span className="font-medium text-foreground" data-testid={`text-author-${article.id}`}>
              {article.author.username}
            </span>
            {article.author.isAdmin && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            <span>•</span>
            <time dateTime={new Date(article.createdAt).toISOString()} data-testid={`text-timestamp-${article.id}`}>
              {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
            </time>
            {!isOwnPost && isAdmin && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  Admin can delete
                </Badge>
              </>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{article.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
