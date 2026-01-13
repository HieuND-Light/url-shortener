import { IsUrl, IsNotEmpty } from 'class-validator';

export class ShortenUrlDto {
    @IsNotEmpty({ message: 'URL dài không được để trống.' })
    @IsUrl({}, { message: 'URL dài không hợp lệ.' })
    longUrl!: string;
}