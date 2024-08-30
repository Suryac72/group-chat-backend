import User from "../models/userModel.js";

export async function updateUserGroups(userId, groupId, isAdmin) {
  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { groups: groupId } 
    },
    { new: true }
  );
}

export async function removeUserGroupAssociation(userId, groupId) {
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { groups: groupId } 
    },
    { new: true }
  );
}