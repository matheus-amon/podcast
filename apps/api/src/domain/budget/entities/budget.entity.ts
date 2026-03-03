/**
 * Budget Entity
 *
 * Representa um item de orçamento (receita ou despesa) no sistema
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';
import { BudgetType } from '../value-objects/budget-type.enum';
import { BudgetStatus } from '../value-objects/budget-status.enum';
import { Money } from '../value-objects/money.vo';

export interface BudgetProps extends BaseEntityProps {
  id: string;
  concept: string;
  amount: number;
  type: BudgetType;
  category: string;
  date: Date;
  responsible?: string;
  status: BudgetStatus;
  connectedEpisodeId?: number;
}

export interface CreateBudgetDTO {
  concept: string;
  amount: number;
  type: BudgetType;
  category: string;
  date?: Date;
  responsible?: string;
  status?: BudgetStatus;
  connectedEpisodeId?: number;
}

export class Budget extends BaseEntity<BudgetProps> {
  private _money?: Money;

  private constructor(props: BudgetProps) {
    super(props);
  }

  /**
   * Cria um novo budget
   */
  static create(props: CreateBudgetDTO): Budget {
    // Validações
    if (!props.concept || props.concept.trim().length === 0) {
      throw new Error('Concept is required');
    }

    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!props.category || props.category.trim().length === 0) {
      throw new Error('Category is required');
    }

    const now = new Date();

    return new Budget({
      id: crypto.randomUUID(),
      concept: props.concept.trim(),
      amount: Math.round(props.amount * 100) / 100,
      type: props.type,
      category: props.category.trim(),
      date: props.date ?? now,
      responsible: props.responsible?.trim(),
      status: props.status ?? BudgetStatus.PENDING,
      connectedEpisodeId: props.connectedEpisodeId,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria um budget a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: BudgetProps): Budget {
    return new Budget(props);
  }

  /**
   * Retorna o Money value object
   */
  getMoneyVO(): Money {
    if (!this._money) {
      this._money = new Money({ amount: this.props.amount });
    }
    return this._money;
  }

  /**
   * Retorna o conceito do budget
   */
  get concept(): string {
    return this.props.concept;
  }

  /**
   * Retorna o valor do budget
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * Retorna o tipo do budget (INCOME ou EXPENSE)
   */
  get type(): BudgetType {
    return this.props.type;
  }

  /**
   * Retorna a categoria do budget
   */
  get category(): string {
    return this.props.category;
  }

  /**
   * Retorna a data do budget
   */
  get date(): Date {
    return this.props.date;
  }

  /**
   * Retorna o responsável pelo budget
   */
  get responsible(): string | undefined {
    return this.props.responsible;
  }

  /**
   * Retorna o status do budget
   */
  get status(): BudgetStatus {
    return this.props.status;
  }

  /**
   * Retorna o ID do episódio conectado
   */
  get connectedEpisodeId(): number | undefined {
    return this.props.connectedEpisodeId;
  }

  /**
   * Atualiza o conceito do budget
   */
  updateConcept(concept: string): void {
    if (!concept || concept.trim().length === 0) {
      throw new Error('Concept is required');
    }
    this.props.concept = concept.trim();
    this.touch();
  }

  /**
   * Atualiza o valor do budget
   */
  updateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    this.props.amount = Math.round(amount * 100) / 100;
    this._money = undefined; // Invalidar cache
    this.touch();
  }

  /**
   * Atualiza a categoria do budget
   */
  updateCategory(category: string): void {
    if (!category || category.trim().length === 0) {
      throw new Error('Category is required');
    }
    this.props.category = category.trim();
    this.touch();
  }

  /**
   * Atualiza o responsável pelo budget
   */
  updateResponsible(responsible: string): void {
    this.props.responsible = responsible?.trim();
    this.touch();
  }

  /**
   * Atualiza a data do budget
   */
  updateDate(date: Date): void {
    this.props.date = date;
    this.touch();
  }

  /**
   * Conecta o budget a um episódio
   */
  connectToEpisode(episodeId: number): void {
    this.props.connectedEpisodeId = episodeId;
    this.touch();
  }

  /**
   * Aprova o budget
   */
  approve(): void {
    if (this.props.status === BudgetStatus.PAID) {
      throw new Error('Cannot approve a budget that is already paid');
    }
    this.props.status = BudgetStatus.APPROVED;
    this.touch();
  }

  /**
   * Marca o budget como pago
   */
  markAsPaid(): void {
    this.props.status = BudgetStatus.PAID;
    this.touch();
  }

  /**
   * Marca o budget como pendente
   */
  markAsPending(): void {
    if (this.props.status === BudgetStatus.PAID) {
      throw new Error('Cannot change status of a paid budget');
    }
    this.props.status = BudgetStatus.PENDING;
    this.touch();
  }

  /**
   * Verifica se o budget é uma receita
   */
  isIncome(): boolean {
    return this.props.type === BudgetType.INCOME;
  }

  /**
   * Verifica se o budget é uma despesa
   */
  isExpense(): boolean {
    return this.props.type === BudgetType.EXPENSE;
  }

  /**
   * Verifica se o budget está pago
   */
  isPaid(): boolean {
    return this.props.status === BudgetStatus.PAID;
  }

  /**
   * Verifica se o budget está aprovado
   */
  isApproved(): boolean {
    return this.props.status === BudgetStatus.APPROVED;
  }

  /**
   * Verifica se o budget está pendente
   */
  isPending(): boolean {
    return this.props.status === BudgetStatus.PENDING || this.props.status === BudgetStatus.PLANNED;
  }

  /**
   * Verifica se o budget está planejado
   */
  isPlanned(): boolean {
    return this.props.status === BudgetStatus.PLANNED;
  }

  /**
   * Formata o valor do budget como string
   */
  formatAmount(locale = 'pt-BR'): string {
    return this.getMoneyVO().format(locale);
  }

  /**
   * Converte budget para objeto simples
   */
  override toObject(): BudgetProps {
    return { ...this.props };
  }
}
