import { Document, Schema, model, Model } from 'mongoose';
import { IUser } from '../types';

interface UserDoc extends Document {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  created_at: Date;
  updated_at: Date;
}

interface UserModel extends Model<UserDoc> {}

const userSchema = new Schema<UserDoc>(
  {
    id: { type: Number, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, min: 0, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

userSchema.pre('save', async function () {
  if (this.isNew && !this.id) {
    const lastUser = await userModel.findOne().sort({ id: -1 });
    this.id = lastUser ? lastUser.id + 1 : 1;
  }
});

const userModel = model<UserDoc, UserModel>('User', userSchema);

export default userModel;