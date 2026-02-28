/**
 * Lead Entity
 * 
 * Representa um lead no sistema de vendas
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';
import { Email } from '../value-objects/email.vo';
import { LeadStatus } from '../value-objects/lead-status.enum';

export interface LeadProps extends BaseEntityProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateLeadProps {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  assignedTo?: string;
}

export class Lead extends BaseEntity<LeadProps> {
  private _email?: Email; // Campo privado para validação

  private constructor(props: LeadProps) {
    super(props);
  }

  /**
   * Cria um novo lead
   */
  static create(props: CreateLeadProps): Lead {
    const now = new Date();
    const email = new Email(props.email);
    
    return new Lead({
      id: crypto.randomUUID(),
      name: props.name.trim(),
      email: email.value,
      phone: props.phone?.trim() ?? '',
      status: LeadStatus.PROSPECT,
      source: props.source?.trim() ?? 'unknown',
      assignedTo: props.assignedTo ?? '',
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria um lead a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: LeadProps): Lead {
    return new Lead(props);
  }

  /**
   * Retorna o email como value object
   */
  getEmailVO(): Email {
    if (!this._email) {
      this._email = new Email(this.props.email);
    }
    return this._email;
  }

  /**
   * Retorna o nome do lead
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * Retorna o email do lead (como string)
   */
  get email(): string {
    return this.props.email;
  }

  /**
   * Retorna o telefone do lead
   */
  get phone(): string {
    return this.props.phone;
  }

  /**
   * Retorna o status do lead
   */
  get status(): LeadStatus {
    return this.props.status;
  }

  /**
   * Retorna a origem do lead
   */
  get source(): string {
    return this.props.source;
  }

  /**
   * Retorna o ID do usuário responsável
   */
  get assignedTo(): string {
    return this.props.assignedTo;
  }

  /**
   * Atualiza o nome do lead
   */
  updateName(name: string): void {
    this.props.name = name.trim();
    this.touch();
  }

  /**
   * Atualiza o email do lead
   */
  updateEmail(email: string): void {
    // Validar email
    const emailVO = new Email(email);
    this.props.email = emailVO.value;
    this.touch();
  }

  /**
   * Atualiza o telefone do lead
   */
  updatePhone(phone: string): void {
    this.props.phone = phone.trim();
    this.touch();
  }

  /**
   * Atualiza a origem do lead
   */
  updateSource(source: string): void {
    this.props.source = source.trim();
    this.touch();
  }

  /**
   * Atribui o lead a um usuário
   */
  assignToUser(userId: string): void {
    this.props.assignedTo = userId;
    this.touch();
  }

  /**
   * Atualiza o status do lead
   */
  updateStatus(status: LeadStatus): void {
    this.props.status = status;
    this.touch();
  }

  /**
   * Verifica se o lead é novo (prospect)
   */
  isNew(): boolean {
    return this.props.status === LeadStatus.PROSPECT;
  }

  /**
   * Verifica se o lead foi contatado
   */
  isContacted(): boolean {
    return this.props.status === LeadStatus.CONTACTED;
  }

  /**
   * Verifica se o lead foi confirmado
   */
  isConfirmed(): boolean {
    return this.props.status === LeadStatus.CONFIRMED;
  }

  /**
   * Verifica se o lead foi gravado/convertido
   */
  isRecorded(): boolean {
    return this.props.status === LeadStatus.RECORDED;
  }

  /**
   * Converte lead para objeto simples
   */
  override toObject(): LeadProps {
    return { ...this.props };
  }
}
