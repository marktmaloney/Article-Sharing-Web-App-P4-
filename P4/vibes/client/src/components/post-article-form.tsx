import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Link as LinkIcon } from "lucide-react";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface PostArticleFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function PostArticleForm({ onSubmit, isSubmitting }: PostArticleFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      title: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Card data-testid="form-post-article">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Share an Article
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a descriptive title"
                      {...field}
                      data-testid="input-article-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://example.com/article"
                        className="pl-10"
                        {...field}
                        data-testid="input-article-url"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-article">
                {isSubmitting ? "Posting..." : "Post Article"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
