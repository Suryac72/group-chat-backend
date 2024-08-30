import express from "express";
import {
  createGroup,
  deleteGroup,
  addMember,
  searchGroups,
  removeMember,
  addAdmin,
  removeAdmin,
} from "../controllers/groupController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createGroup);
router.delete("/:id", authenticateToken, deleteGroup);
router.post("/addMember", authenticateToken, addMember);
router.get("/search", searchGroups);
router.post("/removeMember", authenticateToken, removeMember);
router.post("/removeAdmin", authenticateToken, removeAdmin);
router.post("/addAdmin", authenticateToken, addAdmin);

export default router;
