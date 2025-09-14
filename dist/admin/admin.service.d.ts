import { AddAdminDto } from "./add-admin.dto";
import { UpdateAdminDto } from "./update-admin.dto";
import { Admin } from "./admin.entity";
import { Repository } from "typeorm";
import { MailService } from "src/mail/mail.service";
export declare class AdminService {
    private readonly adminRepository;
    private readonly mailService;
    private readonly salt;
    private readonly logger;
    constructor(adminRepository: Repository<Admin>, mailService: MailService);
    findAll(): Promise<Admin[]>;
    getInactive(): Promise<Admin[]>;
    getAdminById(id: number): Promise<Admin>;
    createAdmin(addAdminDto: AddAdminDto): Promise<Admin>;
    updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin>;
    changeStatus(id: number, status: 'active' | 'inactive'): Promise<Admin>;
    deleteAdmin(id: number): Promise<void>;
    getOlderThan(age: number): Promise<Admin[]>;
    findByEmail(email: string): Promise<any>;
    getSellersByAdmin(adminId: number): Promise<import("../seller/seller.entity").Seller[]>;
}
