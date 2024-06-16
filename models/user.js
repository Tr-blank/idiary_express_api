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
    current_identity: {
      type: mongoose.Schema.ObjectId,
      ref:'identity',
      required: false
    },
    main_identity: {
      type: mongoose.Schema.ObjectId,
      ref:'identity',
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('identity', {
  ref: 'identity',
  foreignField: 'user',
  localField: '_id'
})

// userSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'name id createdAt'
//   })
// })

const User = mongoose.model('user', userSchema);

module.exports = User;
