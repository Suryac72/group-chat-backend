import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
});

export default mongoose.model('Group', groupSchema);
