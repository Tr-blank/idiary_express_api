const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: new Date()
    },
    account: {
      type: String,
      required: [true, "帳號為必填"],
      unique: true // 唯一值
    },
    email: {
      type: String,
      required: [true, "信箱為必填"],
      unique: true // 唯一值
    },
    password: {
      type: String,
      required: [true, "密碼為必填"],
      minlength: 8,
      select: false
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
