import { Router } from 'express';
import { eventController } from '../controllers/event.controller';

const router = Router();

// Get events for a store
router.get('/store/:storeId', eventController.getEventsForStore.bind(eventController));

// Get event statistics for a store
router.get('/store/:storeId/stats', eventController.getEventStatsForStore.bind(eventController));

// Create a new event
router.post('/', eventController.createEvent.bind(eventController));

export default router;