import { SellerService } from './seller.service';
import { AddSellerDto } from './add-seller.dto';
import { UpdateSellerDto } from './update-seller.dto';
export declare class SellerController {
    private readonly sellerService;
    constructor(sellerService: SellerService);
    getAllSellers(): Promise<import("./seller.entity").Seller[]>;
    getSellerById(id: number, req: any): Promise<import("./seller.entity").Seller>;
    createSeller(addSellerDto: AddSellerDto, file: Express.Multer.File, req: any): Promise<import("./seller.entity").Seller>;
    updateSeller(id: number, dto: UpdateSellerDto, file: Express.Multer.File, req: any): Promise<import("./seller.entity").Seller>;
    changeSellerStatus(id: number, status: 'active' | 'inactive', req: any): Promise<import("./seller.entity").Seller>;
    deleteSeller(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    searchSellers(query: string): Promise<import("./seller.entity").Seller[]>;
    getSellersByAdmin(req: any): Promise<import("./seller.entity").Seller[]>;
    updateOwnSeller(dto: UpdateSellerDto, file: Express.Multer.File, req: any): Promise<import("./seller.entity").Seller>;
    getActiveSellers(): Promise<import("./seller.entity").Seller[]>;
    getOwnProfile(req: any): Promise<import("./seller.entity").Seller>;
    getOwnProducts(req: any): Promise<import("../product/product.entity").Product[]>;
    getOwnOrders(req: any): Promise<import("../order/order.entity").Order[]>;
}
