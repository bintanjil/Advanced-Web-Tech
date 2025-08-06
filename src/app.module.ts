import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ProductService } from './product/product.service';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin/admin.entity';
import { Customer } from './customer/customer.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: 'localhost',
      port: 5432,
      username:'postgres',
      password:'5668',
      database:'ecommerce',
      entities:[Admin, Customer],
      synchronize:true,


    })

    ,
    AdminModule , ProductModule, CustomerModule],
  controllers: [],
  providers: [],
  
})
export class AppModule {}
