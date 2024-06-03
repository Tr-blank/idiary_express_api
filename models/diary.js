const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: new Date()
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref:'user',
      required: [true, '使用者資訊不得為空']
    },
    identity: {
      type: mongoose.Schema.ObjectId,
      ref:'identity',
      required: [true, '身分資訊不得為空']
    },
    title:{
      type: String,
      default: ''
    },
    content:{
      type: String,
      required: [true, '日記內容不得為空']
    },
    image:{
      type: String,
      default: ''
    },
    type:{
      type: String,
      default: 'private', // private、public、exchange
      required: [true, '日記類型不得為空']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const diaries = mongoose.model('diary', diarySchema);

module.exports = diaries;
