import { redirect, notFound } from 'next/navigation';
import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from '@/lib/data-source';
import { Url } from '@/app/entities/Url';

// export async function GET(request: Request) {
  //   const mock = {
    //       text: "Test GET.",
    //       data: request.url.slice(length)
    //     };
    
    //   return new Response(JSON.stringify(mock), {
      //     status: 200,
      //     headers: { 'Content-Type': 'application/json' }
      //   });
      // }

export async function GET(request: Request) {

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const shortCode = segments.pop();

  if (shortCode === 'home' || shortCode === 'admin') {
    return NextResponse.next();
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  const UrlRepository = AppDataSource.getRepository(Url);
  const urlEntry = await UrlRepository.findOne({ where: { short_code: shortCode } });

  // Tim duoc URL -> redirect.
  if (urlEntry) {
    urlEntry.clicks++;
    await UrlRepository.save(urlEntry);
    
    console.log(`[Redirect] Found long URL: ${urlEntry.long_url} for short code: ${shortCode}`);
    await AppDataSource.destroy();
    
    return NextResponse.redirect(urlEntry.long_url);

  } else {
    // Neu khong ton tai short code tra ve 404
    console.log(`[Redirect] Short code not found in DB: ${shortCode}`);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    return notFound();
  }
}