import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('genres')
@ObjectType()
export class Genre extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Field(() => String)
  name!: string;

  @OneToMany(() => Book, (book) => book.genres)
  @Field(() => [Book], { nullable: 'itemsAndList' })
  books!: Relation<Book[]>;
}
