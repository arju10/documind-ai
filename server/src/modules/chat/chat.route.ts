import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { askQuestion, getChatHistory, getAllChats, deleteChat } from './chat.controller';

const router: Router = Router();

router.use(authenticate); // all routes below require login

router.post('/ask', askQuestion);
router.get('/', getAllChats);
router.get('/history/:documentId', getChatHistory);
router.delete('/:chatId', deleteChat);

export default router;
