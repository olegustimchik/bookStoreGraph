import { Field, ObjectType } from "@nestjs/graphql";
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";


@ObjectType({ isAbstract: true })
export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => String)
    id!: string;

    @CreateDateColumn({ type: 'timestamp' })
    @Field(() => Date)
    createdAt!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    @Field(() => Date, { nullable: true })
    deletedAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    @Field(() => Date)
    updatedAt!: Date;
} 