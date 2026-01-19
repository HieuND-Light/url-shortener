import "reflect-metadata";
import { DataSource } from "typeorm";
import { Url } from "@/app/entities/Url";

// Define the connection options, reading from environment variables
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  
  synchronize: process.env.NODE_ENV !== 'production',
  logging: ["error", "warn"],
  entities: [Url],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false, // Set to true if you have a valid CA certificate
  },
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
