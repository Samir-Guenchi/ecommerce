import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { EventStatus } from '../entities';

export class EventController {
  /**
   * Get events for a store (for dashboard/analytics)
   * GET /api/events/store/:storeId
   */
  async getEventsForStore(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { eventType, status, startDate, endDate, limit } = req.query;

      const parsedStoreId = parseInt(storeId, 10);
      if (Number.isNaN(parsedStoreId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      const filters: any = {};
      if (eventType) filters.eventType = eventType;
      if (status && Object.values(EventStatus).includes(status as EventStatus)) {
        filters.status = status;
      }
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string, 10);

      const events = await eventService.getEventsForStore(parsedStoreId, filters);

      res.status(200).json({ events });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch events' });
    }
  }

  /**
   * Get event statistics for a store
   * GET /api/events/store/:storeId/stats
   */
  async getEventStatsForStore(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { startDate, endDate } = req.query;

      const parsedStoreId = parseInt(storeId, 10);
      if (Number.isNaN(parsedStoreId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await eventService.getEventStatsForStore(parsedStoreId, start, end);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch event stats' });
    }
  }

  /**
   * Create a new event (internal use, but can be exposed if needed)
   * POST /api/events
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, userId, storeId, eventData } = req.body;

      if (!eventType) {
        res.status(400).json({ error: 'Event type is required' });
        return;
      }

      const event = await eventService.createEvent(
        eventType,
        userId || null,
        storeId || null,
        eventData || {}
      );

      res.status(201).json({ event });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create event' });
    }
  }
}

export const eventController = new EventController();