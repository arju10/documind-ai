import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './auth.interface';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const obj = ret as Record<string, unknown>;
        delete obj['password'];
        return obj;
      },
    },
  },
);

// Hash password before saving
UserSchema.pre('save', async function () {
  const user = this as IUser;

  if (!user.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

export default mongoose.model<IUser>('User', UserSchema);
