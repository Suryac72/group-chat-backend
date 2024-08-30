import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import { body, validationResult, param } from "express-validator";
import { isAdmin } from "../middlewares/checkAdminMiddleware.js";
import {
  updateUserGroups,
  removeUserGroupAssociation,
} from "../utils/utils.js";


export async function createGroup(req, res) {
  try {
    await body("name")
      .notEmpty()
      .withMessage("Group name is required")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: errors.array().map((err) => err.msg) });
    }

    const { name } = req.body;

    const group = new Group({
      name,
      members: [req.user.id],
      admins: [req.user.id],
    });
    await group.save();

    // Update user document to include this group
    await updateUserGroups(req.user.id, group._id, true);

    return res.status(201).json(group);
  } catch (err) {
    return res.status(503).json({ message: "Something went wrong" });
  }
}


// Delete Group Controller
export async function deleteGroup(req, res) {
  try {
    await param("id").isMongoId().withMessage("Invalid group ID").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const group = await Group.findByIdAndDelete(id);

    if (group) {
      // Remove group association from all users
      await User.updateMany(
        { _id: { $in: group.members } },
        { $pull: { groups: id } }
      );
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Remove Member from Group Controller
export async function removeMember(req, res) {
  try {
    await body("groupId").isMongoId().withMessage("Invalid group ID").run(req);
    await body("userId").isMongoId().withMessage("Invalid user ID").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, userId } = req.body;

    // Check if the user is an admin
    await isAdmin(req, res, async () => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $pull: { members: userId } },
        { new: true }
      );

      if (group) {
        // Remove user group association
        await removeUserGroupAssociation(userId, groupId);
      }

      res.json(group);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Remove Admin from Group Controller
export async function removeAdmin(req, res) {
  try {
    await body("groupId").isMongoId().withMessage("Invalid group ID").run(req);
    await body("userId").isMongoId().withMessage("Invalid user ID").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, userId } = req.body;

    // Check if the user is an admin
    await isAdmin(req, res, async () => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $pull: { admins: userId } },
        { new: true }
      );

      if (group) {
        // Update user document to unmark as admin in this group
        await updateUserGroups(userId, groupId, false);
      }

      res.json(group);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Add Member to Group Controller
export async function addMember(req, res) {
  try {
    await body("groupId").isMongoId().withMessage("Invalid group ID").run(req);
    await body("userId").isMongoId().withMessage("Invalid user ID").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, userId } = req.body;

    // Check if the user is an admin
    await isAdmin(req, res, async () => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: userId } },
        { new: true }
      );

      if (group) {
        // Update user document to include this group
        await updateUserGroups(userId, groupId, false);
      }

      res.json(group);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}



export async function searchGroups(req, res) {
  try {
    const { query } = req.query;
    const groups = await Group.find({ name: { $regex: query, $options: "i" } });
    const mappedResponse = [];

    if (groups?.length > 0) {
      for (const group of groups) {
        // Find users but exclude the password field
        const users = await User.find(
          { _id: { $in: group.members } },
          "-password"
        );

        const mappedObj = {
          _id: group._id,
          name: group.name,
          members: users,
        };
        mappedResponse.push(mappedObj);
      }
    }

    res.json(mappedResponse);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}



// Add Admin to Group Controller
export async function addAdmin(req, res) {
  try {
    await body("groupId").isMongoId().withMessage("Invalid group ID").run(req);
    await body("userId").isMongoId().withMessage("Invalid user ID").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, userId } = req.body;

    // Check if the user is an admin
    await isAdmin(req, res, async () => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { admins: userId } },
        { new: true }
      );

      if (group) {
        // Update user document to mark as admin in this group
        await updateUserGroups(userId, groupId, true);
      }

      res.json(group);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
