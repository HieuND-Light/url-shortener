import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/data-source';
import { AppDataSource } from '@/lib/data-source';
import { Url } from '@/app/entities/Url';

export async function GET(request: Request) {
  const mock = {
      text: "Hello, World!"
    };
  
  return new Response(JSON.stringify(mock), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request){

  const body = await request.json();

  // const url = new URL(body.shortUrl);
  // const segments = url.pathname.split('/').filter(Boolean);
  // const shortCode = segments.pop();
  const shortCode = body.short_code;

  try {
    await connectDB();
    const UrlRepository = AppDataSource.getRepository(Url);
    const checkShortCode = await UrlRepository.findOne({ where: { short_code: shortCode } });
    
    if (checkShortCode) {
      await UrlRepository.delete({ short_code: shortCode });
      await AppDataSource.destroy();
      return NextResponse.json({status: 200});
    } else {
        return NextResponse.json({ error: 'Short code không tồn tại.' });
    }

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' });
  }
}