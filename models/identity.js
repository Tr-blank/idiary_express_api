const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref:'user',
      required: [true, '使用者資訊不得為空']
    },
    id: {
      type: Number,
      default: new Date()
    },
    code_name: {
      type: String,
      required: [true, "代號為必填"],
      unique: true // 唯一值
    },
    name:{
      type: String,
      required: [true, '身份姓名為必填'],
    },
    avatar:{
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const identities = mongoose.model('identity', identitySchema);

module.exports = identities;
