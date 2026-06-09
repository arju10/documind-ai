import { Router } from 'express';
import documentRoutes from '../modules/document/document.route.js';

const router: Router = Router();

router.use('/documents', documentRoutes);

// Letter we will add more module routes here like auth, chat, etc.
// router.use('/auth', authRoutes);
// router.use('/chat', chatRoutes);

export default router;
