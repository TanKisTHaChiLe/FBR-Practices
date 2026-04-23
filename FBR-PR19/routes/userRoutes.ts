import { Router } from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    getUserStats
} from '../controllers/userController';

const router = Router();

router.post('/users', createUser);           // POST /api/users
router.get('/users', getUsers);               // GET /api/users
router.get('/users/:id', getUserById);        // GET /api/users/:id
router.patch('/users/:id', updateUser);       // PATCH /api/users/:id
router.delete('/users/:id', deleteUser);      // DELETE /api/users/:id

router.get('/users/search', searchUsers);     // GET /api/users/search?first_name=...
router.get('/users/stats/summary', getUserStats); // GET /api/users/stats/summary

export default router;