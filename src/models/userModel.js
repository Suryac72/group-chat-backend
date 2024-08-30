import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  phoneNo: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});

export default mongoose.model('User', userSchema);
