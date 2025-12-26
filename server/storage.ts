import { db } from "./db";
import { favorites, type Favorite, type InsertFavorite } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFavorites(): Promise<Favorite[]> {
    return await db.select().from(favorites);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();
    return favorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }
}

export const storage = new DatabaseStorage();
