'use server'

import { AppDataSource } from "@/lib/data-source";
import { Url } from '@/app/entities/Url';

export async function getAllLinks() {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    
    const urlRepository = AppDataSource.getRepository(Url);
    const links = await urlRepository.find({
        order: { created_at: "DESC" }
    });

    const plainLinks = links.map(link => ({
        id: link.id,
        long_url: link.long_url,
        short_code: link.short_code,
        clicks: link.clicks,
        created_at: link.created_at instanceof Date 
            ? link.created_at.toISOString() 
            : link.created_at, 
    }));

    return { success: true, data: plainLinks };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to fetch links" };
  }
}