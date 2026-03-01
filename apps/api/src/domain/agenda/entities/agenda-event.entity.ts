/**
 * AgendaEvent Entity
 * 
 * Representa um evento de agenda no sistema
 */

import { BaseEntity } from '@domain/common/entities/base.entity';
import { EventType, EventStatus } from '../value-objects/event-status.enum';

export interface AgendaEventProps {
  id: string;
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  type: EventType;
  status: EventStatus;
  attendees: string[];
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateAgendaEventDTO {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  type: EventType;
  attendees?: string[];
  color?: string;
}

export class AgendaEvent extends BaseEntity<AgendaEventProps> {
  private constructor(props: AgendaEventProps) {
    super(props);
  }

  /**
   * Cria um novo evento de agenda
   */
  static create(props: CreateAgendaEventDTO): AgendaEvent {
    // Validações
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (props.endAt <= props.startAt) {
      throw new Error('End date must be after start date');
    }

    const now = new Date();

    return new AgendaEvent({
      id: crypto.randomUUID(),
      title: props.title.trim(),
      description: props.description?.trim(),
      startAt: props.startAt,
      endAt: props.endAt,
      type: props.type,
      status: EventStatus.SCHEDULED,
      attendees: props.attendees || [],
      color: props.color || '#3B82F6',
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Cria um evento a partir de props existentes (para recuperação do banco)
   */
  static fromProps(props: AgendaEventProps): AgendaEvent {
    return new AgendaEvent(props);
  }

  /**
   * Retorna o título do evento
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Retorna a descrição do evento
   */
  get description(): string | undefined {
    return this.props.description;
  }

  /**
   * Retorna a data/hora de início
   */
  get startAt(): Date {
    return this.props.startAt;
  }

  /**
   * Retorna a data/hora de término
   */
  get endAt(): Date {
    return this.props.endAt;
  }

  /**
   * Retorna o tipo do evento
   */
  get type(): EventType {
    return this.props.type;
  }

  /**
   * Retorna o status do evento
   */
  get status(): EventStatus {
    return this.props.status;
  }

  /**
   * Retorna a lista de participantes
   */
  get attendees(): string[] {
    return this.props.attendees;
  }

  /**
   * Retorna a cor do evento
   */
  get color(): string {
    return this.props.color || '#3B82F6';
  }

  /**
   * Atualiza o título do evento
   */
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    this.props.title = title.trim();
    this.touch();
  }

  /**
   * Atualiza a descrição do evento
   */
  updateDescription(description: string): void {
    this.props.description = description.trim();
    this.touch();
  }

  /**
   * Cancela o evento
   */
  cancel(reason: string): void {
    this.props.status = EventStatus.CANCELLED;
    this.touch();
  }

  /**
   * Marca o evento como completado
   */
  markAsCompleted(): void {
    this.props.status = EventStatus.COMPLETED;
    this.touch();
  }

  /**
   * Reagenda o evento para novo horário
   */
  reschedule(newStart: Date, newEnd: Date): void {
    if (newEnd <= newStart) {
      throw new Error('End date must be after start date');
    }
    this.props.startAt = newStart;
    this.props.endAt = newEnd;
    this.touch();
  }

  /**
   * Adiciona um participante ao evento
   */
  addAttendee(userId: string): void {
    if (!this.props.attendees.includes(userId)) {
      this.props.attendees.push(userId);
      this.touch();
    }
  }

  /**
   * Remove um participante do evento
   */
  removeAttendee(userId: string): void {
    const index = this.props.attendees.indexOf(userId);
    if (index > -1) {
      this.props.attendees.splice(index, 1);
      this.touch();
    }
  }

  /**
   * Verifica se este evento sobrepõe com outro evento
   */
  overlapsWith(other: AgendaEvent): boolean {
    return (
      this.props.startAt < other.props.endAt &&
      this.props.endAt > other.props.startAt
    );
  }

  /**
   * Retorna a duração do evento em minutos
   */
  duration(): number {
    const diffMs = this.props.endAt.getTime() - this.props.startAt.getTime();
    return Math.floor(diffMs / 60000);
  }

  /**
   * Verifica se o evento está agendado
   */
  isScheduled(): boolean {
    return this.props.status === EventStatus.SCHEDULED;
  }

  /**
   * Verifica se o evento está em andamento
   */
  isInProgress(): boolean {
    return this.props.status === EventStatus.IN_PROGRESS;
  }

  /**
   * Verifica se o evento está completado
   */
  isCompleted(): boolean {
    return this.props.status === EventStatus.COMPLETED;
  }

  /**
   * Verifica se o evento está cancelado
   */
  isCancelled(): boolean {
    return this.props.status === EventStatus.CANCELLED;
  }

  /**
   * Converte evento para objeto simples
   */
  override toObject(): AgendaEventProps {
    return { ...this.props };
  }
}
