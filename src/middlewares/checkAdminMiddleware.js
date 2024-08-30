import Group from "../models/groupModel.js";

export async function isAdmin(req, res, next) {
  const { groupId } = req.body;
  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const isAdmin = group.admins.includes(req.user.id);
  
  if (!isAdmin) {
    return res.status(403).json({ message: 'You are not an admin of this group' });
  }

  next();
}