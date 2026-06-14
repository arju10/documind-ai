import { Router } from 'express';
import documentRoutes from '../modules/document/document.route';
import chatRoutes from '../modules/chat/chat.route';
import authRoutes from '../modules/auth/auth.route';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);

export default router;
