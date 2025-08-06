import { Type } from "class-transformer";
import { IsEmail, IsIn, IsInt, isInt, isNotEmpty, IsNotEmpty, IsOptional, Matches, Min, MinLength } from "class-validator";

export class AddAdminDto{

    @IsInt()
    @Min(1,{message: "Id Must Be a Positive Number"})
    @Type(() => Number)
    id : number;

    @IsNotEmpty()
    @MinLength(5)
    @Matches(/^[A-Z][a-zA-Z\s]*$/, { message: 'Name should start with a capital letter and  must contain only alphabets' })
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[a-zA-Z0-9._%+-]+@aiub\.edu$/, { message: 'Email must be a valid @aiub.edu address' })
    email: string;

    @IsNotEmpty({ message: 'NID number is required' })
    @Matches(/^\d{10,17}$/, {
    message: 'Bangladeshi NID must be 10 to 17 digits',
    })
    nid: string;

    @IsInt()
    @Min(18,{message:"Admin must be at least 18 years old"})
    @Type(() => Number)
    age : number;

    @IsOptional()
    @IsIn(['active', 'inactive'])
    status?:'active' | 'inactive';
    
    @IsOptional()
    fileName?:string;
}