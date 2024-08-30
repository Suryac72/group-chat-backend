import {sendMessage, likeMessage,getMessagesByGroup} from '../controllers/messageController.js';
import express from 'express';
import authenticateToken  from '../middlewares/authMiddleware.js';
 

const router = express.Router();

router.post('/', authenticateToken, sendMessage);
router.post('/like/:id', authenticateToken, likeMessage);
router.get('/group/:groupId', authenticateToken, getMessagesByGroup);


export default router;

