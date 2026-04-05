// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // Hashed with bcrypt before saving — plain-text never persisted
    passwordHash: {
      type:   String,
      select: false,  // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

// Strip passwordHash from all JSON responses
userSchema.set('toJSON', {
  transform(_, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
