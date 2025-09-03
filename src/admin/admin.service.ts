import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common";
import { AddAdminDto } from "./add-admin.dto";
import { UpdateAdminDto } from "./update-admin.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Admin } from "./admin.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { MailService } from "src/mail/mail.service";

@Injectable()
export class AdminService {
    private readonly salt = 10;
    private readonly logger = new Logger(AdminService.name);
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository:Repository<Admin>,
        private readonly mailService: MailService,
    ){}

    async findAll():Promise<Admin[]> {
        return this.adminRepository.find();
    }

    async getAdminById(id: number):Promise<Admin> {
        const admin = await this.adminRepository.findOne({where:{id}})
        if (!admin) throw new NotFoundException("Admin not found");
        return admin;
    }

      async createAdmin(addAdminDto: AddAdminDto): Promise<Admin> {
    const idExist = await this.adminRepository.findOne({ where: { id: addAdminDto.id } });
    if (idExist) throw new ConflictException('Admin with the same ID already exists');

    const emailExists = await this.adminRepository.findOne({ where: { email: addAdminDto.email } });
    if (emailExists) throw new ConflictException('Email already in use');

    const phoneExists = await this.adminRepository.findOne({ where: { phone: addAdminDto.phone } });
    if (phoneExists) throw new ConflictException('Phone number already in use');

    const hashedPassword = await bcrypt.hash(addAdminDto.password, this.salt);

    const newCreatedAdmin = this.adminRepository.create({
      ...addAdminDto,
      password: hashedPassword
    });
    
    const savedAdmin = await this.adminRepository.save(newCreatedAdmin);
    
    try {
      await this.mailService.sendAdminWelcomeEmail(savedAdmin.email, savedAdmin.name);
    } catch (error) {
      this.logger.error('Failed to send welcome email to admin', error);
     
    }
    
    return savedAdmin;
  }
    

    async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
        const admin = await this.getAdminById(id);

        if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
            const existingAdmin = await this.adminRepository.findOne({ where: { email: updateAdminDto.email } });
            if (existingAdmin) throw new ConflictException('Email already exists');
        }

        if (updateAdminDto.phone && updateAdminDto.phone !== admin.phone) {
            const phoneExists = await this.adminRepository.findOne({ where: { phone: updateAdminDto.phone } });
            if (phoneExists) throw new ConflictException('Phone number already exists');
        }

        
        if (updateAdminDto.password) {
            updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, this.salt);
        }

        return await this.adminRepository.save({ ...admin, ...updateAdminDto });
    }


    async changeStatus(id: number, status: 'active' | 'inactive'): Promise<Admin> {
    const admin = await this.getAdminById(id);
    admin.status = status;
    return await this.adminRepository.save(admin);
}

    async deleteAdmin(id : number): Promise<void>{
        const admin = await this.getAdminById(id);
        await this.adminRepository.remove(admin);

    }
    async getInactive():Promise<Admin[]>{
        return await this.adminRepository.find({where:{status:'inactive'}});
    }
    async getOlderThan(age:number):Promise<Admin[]>{
        return await this.adminRepository.createQueryBuilder('admin').where('admin.age> :age',{age}).getMany();
    }
    async findByEmail(email: string): Promise<any> {
    return this.adminRepository.findOne({ 
    where: { email },
    select: ['id', 'email', 'password']
    });
}
async getSellersByAdmin(adminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      relations: ['sellers'],
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin.sellers ?? [];
  }


    
    
}
