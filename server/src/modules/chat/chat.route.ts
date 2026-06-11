import { Router } from 'express';
import { askQuestion, getChatHistory, getAllChats, deleteChat } from './chat.controller';

const router: Router = Router();

router.post('/ask', askQuestion);
router.get('/', getAllChats);
router.get('/history/:documentId', getChatHistory);
router.delete('/:chatId', deleteChat);

export default router;
