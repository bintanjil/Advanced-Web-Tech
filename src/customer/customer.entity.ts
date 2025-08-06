import { Column, Entity, PrimaryColumn, BeforeInsert } from "typeorm";

@Entity()
export class Customer {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 150 })
    fullName: string;

    @Column({ default: false })
    isActive: boolean;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    gender: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    fileName: string;

    @BeforeInsert()
    generateId() {
        const year = new Date().getFullYear();
        const random = Math.floor(10000 + Math.random() * 46723);
        const month = new Date().getMonth() + 1;
        this.id = `${year}-${random}-${month}`;
    }
}
