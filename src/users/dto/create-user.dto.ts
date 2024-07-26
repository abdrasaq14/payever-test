import { IsString, IsEmail } from "class-validator";

export class CreateUserDto {
  @IsString()
    first_name: string;
    
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    avatar: string;

}