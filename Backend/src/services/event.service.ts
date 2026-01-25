import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Event, EventStatus } from '../entities';

export class EventService {
  private eventRepository: Repository<Event>;

  constructor() {
    this.eventRepository = AppDataSource.getRepository(Event);
  }

  /**
   * Create a new event
   */
  async createEvent(
    eventType: string,
    userId?: number | null,
    storeId?: number | null,
    eventData?: Record<string, any>
  ): Promise<Event> {
    const event = this.eventRepository.create({
      eventType,
      userId,
      storeId,
      eventData,
      status: EventStatus.ACTIVE,
    });

    return await this.eventRepository.save(event);
  }

  /**
   * Get events for a store with optional filtering
   */
  async getEventsForStore(
    storeId: number,
    filters?: {
      eventType?: string;
      status?: EventStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<Event[]> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.storeId = :storeId', { storeId })
      .orderBy('event.createdAt', 'DESC');

    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters?.status) {
      query.andWhere('event.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return await query.getMany();
  }

  /**
   * Get event statistics for a store
   */
  async getEventStatsForStore(
    storeId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    recent: Event[];
  }> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.storeId = :storeId', { storeId });

    if (startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate });
    }

    const events = await query.getMany();

    const byType: Record<string, number> = {};
    events.forEach(event => {
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
      recent: events.slice(0, 10),
    };
  }

  /**
   * Update event status
   */
  async updateEventStatus(eventId: number, status: EventStatus): Promise<Event | null> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) return null;

    event.status = status;
    return await this.eventRepository.save(event);
  }
}

export const eventService = new EventService();