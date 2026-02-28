/**
 * Repository Port - Interface base para todos os repositórios
 * 
 * Define operações CRUD básicas que todos os repositórios devem implementar.
 * Segue o padrão Repository da arquitetura hexagonal.
 */

export interface IRepository<T, ID = string> {
  /**
   * Busca uma entity pelo ID
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Busca todas as entities (com paginação opcional)
   */
  findAll(offset?: number, limit?: number): Promise<T[]>;

  /**
   * Cria uma nova entity
   */
  create(entity: T): Promise<void>;

  /**
   * Atualiza uma entity existente
   */
  update(entity: T): Promise<void>;

  /**
   * Remove uma entity (pode ser soft delete)
   */
  delete(id: ID): Promise<void>;
}
