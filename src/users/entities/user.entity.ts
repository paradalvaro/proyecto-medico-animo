import { importantPhone } from '../interfaces/importantPhones.interface';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompleteForm } from '../interfaces/recipe.interface';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { default: '', nullable: false })
  name: string;

  @Column('text', { unique: true, nullable: false })
  email: string;

  @Column('text', { default: '', nullable: false })
  phoneNumber: string;

  @Column('text', { select: false, nullable: false })
  password: string;

  @Column('bool', { default: true, nullable: false })
  isActive: boolean;

  @Column('text', { default: 'paciente', nullable: false })
  rol: string;

  @Column('text', { array: true, nullable: true })
  podromosManiaca: string[];

  @Column('text', { array: true, nullable: true })
  podromosDepresiva: string[];

  @Column('text', { array: true, nullable: true })
  senalesAlerta: string[];

  @Column('text', { array: true, nullable: true })
  distracciones: string[];

  @Column('text', { array: true, nullable: true })
  razonesVivir: string[];

  @Column('text', { array: true, nullable: true })
  entornoSeguro: string[];

  @Column('text', { array: true, nullable: true })
  importantPhones: importantPhone[];

  @Column('json', { default: {}, nullable: true })
  completeForm: CompleteForm;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
