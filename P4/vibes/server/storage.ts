import { users, articles, type User, type InsertUser, type Article, type InsertArticle, type ArticleWithAuthor } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  
  getArticles(): Promise<ArticleWithAuthor[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle & { authorId: string }): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: insertUser.password,
        isAdmin: insertUser.isAdmin || false,
      })
      .returning();
    return user;
  }

  async getArticles(): Promise<ArticleWithAuthor[]> {
    const result = await db
      .select({
        id: articles.id,
        url: articles.url,
        title: articles.title,
        authorId: articles.authorId,
        createdAt: articles.createdAt,
        author: {
          id: users.id,
          username: users.username,
          isAdmin: users.isAdmin,
        },
      })
      .from(articles)
      .innerJoin(users, eq(articles.authorId, users.id))
      .orderBy(desc(articles.createdAt));
    
    return result;
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertArticle & { authorId: string }): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values({
        url: insertArticle.url,
        title: insertArticle.title,
        authorId: insertArticle.authorId,
      })
      .returning();
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }
}

export const storage = new DatabaseStorage();
