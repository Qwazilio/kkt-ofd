import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notify')
export class Notify {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  matchField: string;

  @Column({ nullable: false })
  matchValue: string;

  @Column({ nullable: false })
  dayBefore: number;

  @Column({ default: true, nullable: false })
  enabled: boolean;

  @Column({ default: true, nullable: false })
  skipInactive: boolean;
}
