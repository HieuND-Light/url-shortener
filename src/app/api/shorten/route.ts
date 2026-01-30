import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/data-source';
import { AppDataSource } from '@/lib/data-source';
import { Url } from '@/app/entities/Url';
import { generateShortCode } from './service';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  // For example, fetch data from your DB here
  const mock = {
      text: "Hello, World!"
    };
  
  return new Response(JSON.stringify(mock), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

/* export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  const { longUrl } = body;

  await connectDB();
 
  // e.g. Insert new user into your DB
  const mock = { 
    shortUrl: 'https://hu.st/?to=' + longUrl,
    qrCode: 'example.com',
    clicks: '0',
    isNew: true
   };
 
  return new Response(JSON.stringify(mock), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
} */

  // Generate a unique short code with nanoid
  // const shortCode = nanoid(7);

// export default async function handler(request: NextApiRequest, response: NextApiResponse) {
export async function POST(request: Request){

  const body = await request.json();
  const { longUrl } = body;

  // const { longUrl } = request.body;
  if (!longUrl || longUrl.trim() === '') {
    return NextResponse.json({ error: 'URL dài không được để trống.' });
  }

  try {
    await connectDB();
    const UrlRepository = AppDataSource.getRepository(Url);

    // Kiểm tra xem longUrl đã tồn tại chưa - Check if the longUrl already exists
    const existingUrl = await UrlRepository.findOne({ where: { long_url: longUrl } });
    
    if (existingUrl) {
      const shortUrl = `${process.env.BASE_URL}/${existingUrl.short_code}`;
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);
      await AppDataSource.destroy();
      return NextResponse.json({ 
        shortUrl: shortUrl,
        qrCode: qrCodeDataUrl,
        clicks: existingUrl.clicks,
        isNew: false,
      });
    }

    //Nếu chưa tồn tại, tạo short_code mới - If not exists, create new shortCode
    let shortCode: string = ''; 
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateShortCode();
      const existingShortCode = await UrlRepository.findOne({ where: { short_code: shortCode } });
      if (!existingShortCode) {
        isUnique = true;
      }
    }

    // Save the new link
    const newLink = UrlRepository.create({ long_url: longUrl, short_code: shortCode });
    await UrlRepository.save(newLink);
    
    //PostgresCollision error.code = '23505'

    const shortUrl = `${process.env.BASE_URL}/${newLink.short_code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);

    await AppDataSource.destroy();
    return NextResponse.json({ 
      shortUrl: shortUrl,
      qrCode: qrCodeDataUrl,
      clicks: newLink.clicks,
      isNew: true,
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' });
  }

}