const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccessRes = require('../service/handleSuccessRes');
const { isAuth, generateSendJWT } = require('../service/auth');
const User = require('../models/user');
const router = express.Router();

// 註冊
router.post('/sign_up', handleErrorAsync(async(req, res, next) =>{
  let { email, password, confirmPassword, account } = req.body;
  // 內容皆為必填
  if(!email || !password || !confirmPassword || !account){
    return next(appError('400', '欄位未填寫正確！', next));
  }
  // 密碼一致檢查
  if(password !== confirmPassword){
    return next(appError('400', '密碼不一致！', next));
  }
  // 密碼至少8碼
  if(!validator.isLength(password, { min: 8 })){
    return next(appError('400', '密碼字數低於 8 碼', next));
  }
  // 檢查 Email 格式
  if(!validator.isEmail(email)){
    return next(appError('400', 'Email 格式不正確', next));
  }

  // 加密密碼
  password = await bcrypt.hash(req.body.password, 12);
  const newUser = await User.create({
    email,
    password,
    account
  });
  generateSendJWT(newUser, 201, res);
}))

// 登入
router.post('/login', handleErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(appError( 400,'帳號密碼不可為空',next));
  }
  const user = await User.findOne({ email }).select('+password');
  const auth = await bcrypt.compare(password, user.password);
  if(!auth){
    return next(appError(400, '您的密碼不正確', next));
  }
  generateSendJWT(user, 200, res);
}))

// 重設密碼
router.post('/updatePassword', isAuth, handleErrorAsync(async(req,res,next)=>{

  const {password, confirmPassword } = req.body;
  if(password !== confirmPassword){
    return next(appError('400', '密碼不一致！', next));
  }
  newPassword = await bcrypt.hash(password, 12);

  const user = await User.findByIdAndUpdate(req.user.id, {
    password: newPassword
  });
  generateSendJWT(user, 200, res)
}))

// 取得會員資訊
router.get('/profile', isAuth, handleErrorAsync(async (req, res, next) =>{
  handleSuccessRes(res, req.user, '取得成功');
}))

// 更新會員資訊
router.patch('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
  const postData = req.body;
  if (Object.keys(postData).length === 0) return next(appError(400, '未取得更新資料'))
  if (postData.account) postData.account = postData.account.trim()
  if (postData.account === '') return next(appError(400, 'account 不可為空值'))
  const updatedPost = await User.findByIdAndUpdate(req.user.id, postData, { new: true });
  handleSuccessRes(res, updatedPost, '更新成功');
}));

// 取得所有會員
router.get('/', handleErrorAsync(async (req, res, next) => {
  const users = await User.find();
  handleSuccessRes(res, users, '取得成功');
}));

module.exports = router;
