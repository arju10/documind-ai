import { Router } from 'express';
import { upload } from '../../config/multer';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadDocument, getDocuments, deleteDocument } from './document.controller';

const router: Router = Router();

router.use(authenticate); // all routes below require login

router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

export default router;
