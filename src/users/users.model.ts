import { Schema, model } from 'mongoose';
import { IUserDoc } from './interfaces/user.interface';

const UserSchema = new Schema<IUserDoc>({
  first_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  avatar: { type: String, allowNull: true },  
});

export const UserModel = model<IUserDoc>('UserModel', UserSchema);
