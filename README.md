# Trang Web Rút Gọn Link

Ứng dụng rút gọn link đơn giản: chuyển URL dài thành URL ngắn, tạo mã QR, theo dõi lượt click.

## Công nghệ chính

* **Frontend:** Next.js, TypeScript, Tailwind CSS
* **Backend:** Next.js, TypeScript, TypeORM
* **Cơ sở dữ liệu:** PostgreSQL

## Cài đặt & Chạy cục bộ

### Database

Tạo bảng `short_urls` trong PostgreSQL.

### Project

1.  `npm install`
2.  Cấu hình `.env`:
    * `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME, NODE_ENV`
    * `BASE_URL=http://localhost:3000`
3.  `npm run dev`

Truy cập: `http://localhost:3000`