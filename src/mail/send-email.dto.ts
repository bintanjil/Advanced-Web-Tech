import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}