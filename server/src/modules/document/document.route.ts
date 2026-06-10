import { Router } from 'express';
import { upload } from '../../config/multer';
import { uploadDocument, getDocuments, deleteDocument } from './document.controller';

const router: Router = Router();

router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

export default router;
