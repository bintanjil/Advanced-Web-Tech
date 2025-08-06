import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Admin{
    @PrimaryColumn({unsigned:true})
    id : number;
    @Column({type: 'varchar', length:100})
    name : string;
    @Column({type:'varchar', unique:true})
    email: string;
    @Column({length:17})
    nid:string;
    @Column({type:'int' , unsigned:true})
    age:number;
    @Column({default:'active'})
    status? : 'active' | 'inactive';
    @Column({nullable:true})
    fileName : string;

}