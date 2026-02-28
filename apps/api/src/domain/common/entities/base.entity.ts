/**
 * Entity Base - Classe base para todas as entities de domínio
 * 
 * Todas as entities devem estender esta classe para garantir
 * consistência em todo o sistema.
 */

export interface BaseEntityProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export abstract class BaseEntity<Props extends BaseEntityProps> {
  protected props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  /**
   * Retorna o ID da entity
   */
  get id(): string {
    return this.props.id;
  }

  /**
   * Retorna a data de criação
   */
  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Retorna a data de atualização
   */
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Retorna a data de deleção (soft delete)
   */
  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  /**
   * Verifica se a entity foi deletada (soft delete)
   */
  isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  /**
   * Atualiza o timestamp de updatedAt
   */
  touch(): void {
    this.props.updatedAt = new Date();
  }

  /**
   * Realiza soft delete na entity
   */
  delete(): void {
    this.props.deletedAt = new Date();
  }

  /**
   * Converte entity para objeto simples
   */
  toObject(): Props {
    return { ...this.props };
  }
}
