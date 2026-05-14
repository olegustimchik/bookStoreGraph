import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('authors')
@ObjectType()
export class Author extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  fullName!: string;

  @Column({ type: 'timestamp' })
  @Field(() => Date)
  dateOfBirth!: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  dateOfDeath?: Date;

  @OneToMany(() => Book, (book) => book.author)
  @Field(() => [Book], { nullable: 'itemsAndList' })
  books!: Relation<Book[]>;
}
