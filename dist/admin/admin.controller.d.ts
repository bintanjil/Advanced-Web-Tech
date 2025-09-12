import { AdminService } from "./admin.service";
import { AddAdminDto } from "./add-admin.dto";
import { UpdateAdminDto } from "./update-admin.dto";
import { AddSellerDto } from "src/seller/add-seller.dto";
import { SellerService } from "src/seller/seller.service";
import { MailService } from "src/mail/mail.service";
export declare class AdminController {
    private readonly adminService;
    private readonly sellerService;
    private readonly mailService;
    constructor(adminService: AdminService, sellerService: SellerService, mailService: MailService);
    getAllAdmins(req: any): Promise<import("./admin.entity").Admin[]>;
    getAdminById(id: number): Promise<import("./admin.entity").Admin>;
    updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<import("./admin.entity").Admin>;
    changeStatus(id: number, status: 'active' | 'inactive'): Promise<import("./admin.entity").Admin>;
    olderThan(age: number): Promise<import("./admin.entity").Admin[]>;
    getInactiveAdmins(req: any): Promise<import("./admin.entity").Admin[]>;
    deleteAdmin(id: number): Promise<void>;
    addAdmin(addAdminDto: AddAdminDto, file: Express.Multer.File): Promise<import("./admin.entity").Admin>;
    createSeller(dto: AddSellerDto, req: any, file?: Express.Multer.File): Promise<import("../seller/seller.entity").Seller>;
    mySellers(req: any): Promise<import("../seller/seller.entity").Seller[]>;
    searchAllSellers(query: string, req: any): Promise<import("../seller/seller.entity").Seller[]>;
    getInactiveSellers(req: any): Promise<import("../seller/seller.entity").Seller[]>;
    getActiveSeller(req: any): Promise<import("../seller/seller.entity").Seller[]>;
}
