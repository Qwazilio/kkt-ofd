import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Terminal } from './terminal.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false, nullable: false })
  nickname: string;

  @Column({ unique: false, nullable: true })
  name: string;

  @Column({ unique: true, nullable: false })
  token: string;

  @ManyToOne(() => Terminal, (terminal) => terminal, { nullable: true })
  terminals: Terminal[];
}
