import {
  BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    Request,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AddAdminDto } from "./add-admin.dto";
import { UpdateAdminDto } from "./update-admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Express } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { AddSellerDto } from "src/seller/add-seller.dto";
import { SellerService } from "src/seller/seller.service";
import { Roles } from "src/auth/roles.decorator";
import { Role } from "src/auth/role.enum";
import { MailService } from "src/mail/mail.service";

@Controller("admin")
export class AdminController {
    constructor(
      private readonly adminService: AdminService,
      private readonly sellerService: SellerService,
      private readonly mailService: MailService
    ) {}

 
    @Get()
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async getAllAdmins(@Request() req) {
      // Additional role check
      if (req.user.role !== 'admin') {
        throw new UnauthorizedException('Admin access required');
      }
      return await this.adminService.findAll();
    }

    @Get(":id")
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async getAdminById(@Param("id", ParseIntPipe) id: number) {
        return await this.adminService.getAdminById(id);
    }

    // @Post()
    // async createAdmin(@Body() addAdminDto: AddAdminDto) {
    //     return await this.adminService.createAdmin(addAdminDto);
    // }

    @Patch(":id")
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async updateAdmin(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateAdminDto: UpdateAdminDto
    ) {
        return await this.adminService.updateAdmin(id, updateAdminDto);
    }

    @Patch('updateStatus/:id')
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async changeStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: 'active' | 'inactive') {
      const admin = await this.adminService.changeStatus(id, status);
      return admin;
    }

    @Get('upper/:age')
    async olderThan(@Param('age', ParseIntPipe) age: number) {
    return await this.adminService.getOlderThan(age);
    }
    
@Get('inactive/admins')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
async getInactiveAdmins(@Request() req) {
  if (req.user.role?.toLowerCase() !== 'admin') throw new UnauthorizedException();
  return this.adminService.getInactive();
}

    @Delete(":id")
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async deleteAdmin( @Param("id", ParseIntPipe) id: number) {
        return await this.adminService.deleteAdmin(id);
    }


    @Post('createAdmin')
    @UseGuards(AuthGuard)
    @Roles('admin')
    @UseInterceptors(
    FileInterceptor('myfile', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        cb(null, true);
      } else {
        cb(new Error('Wrong Format'), false);
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }),
)
async addAdmin(
  @Body() addAdminDto: AddAdminDto,
  @UploadedFile() file: Express.Multer.File,
    ) {
        console.log(file);
  if (file) {
    addAdminDto.fileName = file.filename; 
  }
  const admin = await this.adminService.createAdmin(addAdminDto);
  return admin;
}
// @Get('check')
// // @UseGuards(AuthGuard)
// // @Roles(Role.ADMIN)
// testProtected() {
//   return {
//     message: 'You are authenticated',
    
//   };
// }
@Post('createSeller')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
      },
    }),
  }),
)
async createSeller(
  @Body() dto: AddSellerDto,
  @Request() req,
  @UploadedFile() file?: Express.Multer.File
) {
  if (req.user.role !== 'admin') {
    throw new UnauthorizedException('Only admins can create sellers');
  }

  if (file) {
    dto.fileName = file.filename;
  }

  // Use sub instead of id to match the JWT payload
  return this.sellerService.createSeller(dto, req.user.sub);  
}

@Get('mySellers')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
  async mySellers(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.adminService.getSellersByAdmin(req.user.sub);
  }
@Get('sellers/search')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
async searchAllSellers(@Query('q') query: string, @Request() req) {
  if (req.user.role !== 'admin') throw new UnauthorizedException();
  return this.sellerService.searchSeller(query ?? '');
}
@Get('sellers/inactive')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
async getInactiveSellers(@Request() req) {
  if (req.user.role !== 'admin') throw new UnauthorizedException();
  return this.sellerService.getInactiveSellers();
}
@Get('sellers/active')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
async getActiveSeller(@Request() req) {
  if (req.user.role !== 'admin') throw new UnauthorizedException();
  return this.sellerService.getActiveSellers();
}


}