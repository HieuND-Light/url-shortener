import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('short_urls') 
export class Url {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true, nullable: false })
  long_url!: string;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: false })
  @Index({ unique: true })
  short_code!: string;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}