import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, Relation, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Author } from '../../author/entities/author.entity';
import { Genre } from '../../genre/entities/genre.entity';

@Entity('books')
@ObjectType()
export class Book extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  title!: string;

  @Column({ type: 'timestamp' })
  @Field(() => Date)
  publicationDate!: Date;

  @ManyToOne(() => Author, (author) => author.books)
  @Field(() => Author)
  author!: Relation<Author>;

  @ManyToMany(() => Genre, (genre) => genre.books)
  @JoinTable()
  @Field(() => [Genre], { nullable: true })
  genres!: Relation<Genre[]>;
}
