/**
 * BudgetTemplate Entity
 *
 * Representa um template de orçamento reutilizável
 * Templates permitem criar múltiplos budget items de uma vez
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import type { BaseEntityProps } from '@domain/common/entities/base.entity';
import { BudgetType } from '../value-objects/budget-type.enum';

export interface BudgetTemplateItem {
  concept: string;
  amount: number;
  type: BudgetType;
  category: string;
}

export interface BudgetTemplateProps extends BaseEntityProps {
  id: string;
  name: string;
  items: BudgetTemplateItem[];
}

export interface CreateBudgetTemplateDTO {
  name: string;
  items: BudgetTemplateItem[];
}

export class BudgetTemplate extends BaseEntity<BudgetTemplateProps> {
  private constructor(props: BudgetTemplateProps) {
    super(props);
  }

  /**
   * Cria um novo template de budget
   */
  static create(props: CreateBudgetTemplateDTO): BudgetTemplate {
    // Validações
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (!props.items || props.items.length === 0) {
      throw new Error('Template must have at least one item');
    }

    // Validar cada item
    props.items.forEach((item, index) => {
      if (!item.concept || item.concept.trim().length === 0) {
        throw new Error(`Item ${index + 1}: concept is required`);
      }
      if (item.amount <= 0) {
        throw new Error(`Item ${index + 1}: amount must be greater than zero`);
      }
      if (!item.category || item.category.trim().length === 0) {
        throw new Error(`Item ${index + 1}: category is required`);
      }
    });

    const now = new Date();

    return new BudgetTemplate({
      id: crypto.randomUUID(),
      name: props.name.trim(),
      items: props.items.map(item => ({
        concept: item.concept.trim(),
        amount: Math.round(item.amount * 100) / 100,
        type: item.type,
        category: item.category.trim(),
      })),
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria um template a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: BudgetTemplateProps): BudgetTemplate {
    return new BudgetTemplate(props);
  }

  /**
   * Retorna o nome do template
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * Retorna os itens do template
   */
  get items(): BudgetTemplateItem[] {
    return this.props.items;
  }

  /**
   * Retorna o número de itens no template
   */
  get itemCount(): number {
    return this.props.items.length;
  }

  /**
   * Calcula o total de receitas no template
   */
  getTotalIncome(): number {
    return this.props.items
      .filter(item => item.type === BudgetType.INCOME)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Calcula o total de despesas no template
   */
  getTotalExpense(): number {
    return this.props.items
      .filter(item => item.type === BudgetType.EXPENSE)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Calcula o saldo total do template
   */
  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  /**
   * Adiciona um item ao template
   */
  addItem(item: BudgetTemplateItem): void {
    if (!item.concept || item.concept.trim().length === 0) {
      throw new Error('Concept is required');
    }
    if (item.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!item.category || item.category.trim().length === 0) {
      throw new Error('Category is required');
    }

    this.props.items.push({
      concept: item.concept.trim(),
      amount: Math.round(item.amount * 100) / 100,
      type: item.type,
      category: item.category.trim(),
    });
    this.touch();
  }

  /**
   * Remove um item do template por índice
   */
  removeItem(index: number): void {
    if (index < 0 || index >= this.props.items.length) {
      throw new Error('Invalid item index');
    }
    this.props.items.splice(index, 1);
    this.touch();
  }

  /**
   * Atualiza o nome do template
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Template name is required');
    }
    this.props.name = name.trim();
    this.touch();
  }

  /**
   * Converte template para objeto simples
   */
  override toObject(): BudgetTemplateProps {
    return { ...this.props };
  }
}
