import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
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
        type: 'varchar',
        name: 'phone_number',
        length: '10',
    })
    phoneNumber: string;

    @Column({
        type: 'int',
        name: 'account_balance',
    })
    accountBalance: number;

    @Column({
        type: 'varchar',
        name: 'address',
    })
    address: string;

    @CreateDateColumn()
    create_At:Date;

    @UpdateDateColumn()
    update_At:Date;
}