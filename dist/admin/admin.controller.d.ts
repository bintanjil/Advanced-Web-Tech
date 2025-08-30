import { AdminService } from "./admin.service";
import { AddAdminDto } from "./add-admin.dto";
import { UpdateAdminDto } from "./update-admin.dto";
import { AddSellerDto } from "src/seller/add-seller.dto";
import { SellerService } from "src/seller/seller.service";
export declare class AdminController {
    private readonly adminService;
    private readonly sellerService;
    constructor(adminService: AdminService, sellerService: SellerService);
    getAllAdmins(): Promise<import("./admin.entity").Admin[]>;
    getAdminById(id: number): Promise<import("./admin.entity").Admin>;
    updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<import("./admin.entity").Admin>;
    changeStatus(id: number, status: 'active' | 'inactive'): Promise<import("./admin.entity").Admin>;
    olderThan(age: number): Promise<import("./admin.entity").Admin[]>;
    getInactiveAdmins(): Promise<import("./admin.entity").Admin[]>;
    deleteAdmin(id: number): Promise<{
        message: string;
    }>;
    addAdmin(addAdminDto: AddAdminDto, file: Express.Multer.File): Promise<import("./admin.entity").Admin>;
    testProtected(): {
        message: string;
    };
    createSeller(dto: AddSellerDto, req: any, file?: Express.Multer.File): Promise<import("../seller/seller.entity").Seller>;
    mySellers(req: any): Promise<import("../seller/seller.entity").Seller[]>;
    searchAllSellers(query: string, req: any): Promise<import("../seller/seller.entity").Seller[]>;
    getInactiveSellers(req: any): Promise<import("../seller/seller.entity").Seller[]>;
    getActiveSeller(req: any): Promise<import("../seller/seller.entity").Seller[]>;
}
