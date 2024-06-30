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
      default: ''
    },
    image:{
      type: String,
      default: ''
    },
    type:{
      type: String,
      default: '私人', // 私人、公開、交換
      required: [true, '日記類型不得為空']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// diarySchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'account _id'
//   }).populate({
//     path: 'identity',
//     select: '_id code_name name avatar'
//   })
// })

const diaries = mongoose.model('diary', diarySchema);

module.exports = diaries;
