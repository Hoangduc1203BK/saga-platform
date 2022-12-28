import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id'
    })
    id: number;

    @Column({
        type: 'varchar',
        name: 'name',
        length: '20'
    })
    name: string;

    @Column({
        type: 'int',
        name: 'inventory',
    })
    inventory: number;

    @Column({
        type: 'int',
        name: 'price',
    })
    price: number;

    @CreateDateColumn()
    create_At:Date;

    @UpdateDateColumn()
    update_At:Date;
}