import express from 'express';
import { createUser, editUser } from '../controllers/userController.js';
import authenticateToken from '../middlewares/authMiddleware.js';



const router = express.Router();

router.post('/', createUser); 
router.put('/:id', authenticateToken, editUser); 


export default router;

