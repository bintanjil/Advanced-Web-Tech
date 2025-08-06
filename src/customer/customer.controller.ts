import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Delete,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Query,
  } from "@nestjs/common";
  import { CustomerService } from "./customer.service";
  import { AddCustomerDto } from "./add-customer.dto";
  import { UpdateCustomerDto } from "./update-customer.dto";
  import { FileInterceptor } from "@nestjs/platform-express";
  import { diskStorage } from "multer";
  import { Express } from "express";

@Controller('customer')
export class CustomerController{
    constructor(private readonly customerService:CustomerService){}
    
    // Retrieve all customers
    @Get()
    getAllCustomers(){
    return this.customerService.findAll();
    }

    // Retrieve customer by id
    @Get('id/:id')
    getCustomerById(@Param('id') id : string){
        return this.customerService.getCustomerById(id);
    }

    // Retrieve customer by username
    @Get('username/:username')
    findByUsername(@Param('username') username: string) {
        return this.customerService.findByUsername(username);
    }

    @Get('substring/:substring')
    findFullNameSubstring(@Param('substring') substring: string) {
        return this.customerService.findByFullNameSubstring(substring);
    }

    // Remove customer - username
    @Delete('username/:username')
    removeByUsername(@Param('username') username: string) {
        return this.customerService.removeByUsername(username);
    }

    @Post()
    createCustomer(@Body() addCustomerDto:AddCustomerDto):object{
       return this.customerService.createCustomer(addCustomerDto); 
    }

    // Add new customer
    @Post("upload")
    @UseInterceptors(
      FileInterceptor("file", {
        storage: diskStorage({
          destination: "./upload",
          filename: (req, file, cb) => {
            const uniqueName = Date.now() + "-" + file.originalname;
            cb(null, uniqueName);
          },
        }),
        limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
        fileFilter: (req, file, cb) => {
          const allowedExtension = /\.(jpg|jpeg|png|webp)$/i;
          if (!allowedExtension.test(file.originalname)) {
            return cb(new BadRequestException("Only image files (jpg, jpeg, png, webp) are allowed"), false);
          }
          cb(null, true);
        },
      })
    )
    addCustomer(
      @UploadedFile() file: Express.Multer.File,
      @Body() addCustomerDto: AddCustomerDto
    ) {
      if (!file) {
        throw new BadRequestException("File is required and must be an image file");
      }

      addCustomerDto.fileName = file.filename;
      return this.customerService.createCustomer(addCustomerDto);
    }
}


    

