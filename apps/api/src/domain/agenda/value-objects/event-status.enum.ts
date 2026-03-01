/**
 * Event Type Enum
 * 
 * Tipos de evento de agenda
 */

export enum EventType {
  RECORDING = 'RECORDING',
  RELEASE = 'RELEASE',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}

/**
 * Event Status Enum
 * 
 * Status de evento de agenda
 */

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
