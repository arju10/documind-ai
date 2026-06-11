import { Router } from 'express';
import documentRoutes from '../modules/document/document.route.js';
import chatRoutes from '../modules/chat/chat.route';

const router: Router = Router();

router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
// Letter we will add more module routes here like auth, chat, etc.
// router.use('/auth', authRoutes);

export default router;
