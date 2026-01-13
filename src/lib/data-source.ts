import "reflect-metadata";
import { DataSource } from "typeorm";
import { Url } from "@/app/entities/Url";

// Define the connection options, reading from environment variables
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: ["error", "warn"],
  entities: [Url],
  subscribers: [],
  migrations: [],
});

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  } else {
    console.log('✓ Database already connected.');
    return;
  }
};
