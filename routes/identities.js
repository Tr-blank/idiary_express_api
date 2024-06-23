const express = require('express');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccessRes = require('../service/handleSuccessRes');
const { isAuth } = require('../service/auth');
const Identities = require('../models/identity');
const Diaries = require('../models/diary');
const User = require('../models/user');
const { connections } = require('mongoose');
const router = express.Router();

// 取得所有身份
router.get('/public', handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const { sort, keyword } = req.query;
  const timeSort = sort == 'asc' ? 'createdAt':'-createdAt'
  const query = keyword ? { 
    isPublicExchangeDiary: true,
    content: new RegExp(req.query.keyword) 
  } : {};
  const identities = await Identities.find(query).populate({
      path: 'user',
      select: 'account'
    }).sort(timeSort);
  handleSuccessRes(res, identities, '取得成功');
}));

// 取得單筆身份
router.get('/public/:id', handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const { id } = req.params;
  const identity = await Identities.findById(id).populate({
    path: 'diary',
    select: 'id title type content'
  })
  const diaries = await Diaries.find({
    type: '公開',
    identity: id,
  })
  const resData = {
    identity,
    publicDiaries: diaries
  }
  handleSuccessRes(res, resData, '取得成功');
}));

// 取得單筆身份
router.get('/:id', handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const { id } = req.params;
  const identity = await Identities.findById(id).populate({
    path: 'user',
    select: 'account'
  }).populate({
    path: 'diary',
    select: 'id title type content'
  });
  handleSuccessRes(res, identity, '取得成功');
}));

// 新增單筆身份
router.post('/', isAuth, handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const postData = { 
    ...req.body,
    user: req.user._id
  }
  if (postData.code_name) postData.code_name = postData.code_name.trim()
  if (postData.code_name === '') return next(appError(400, 'code_name 身份代號不可為空值'))
  if (postData.name) postData.name = postData.name.trim()
  if (postData.name === '') return next(appError(400, 'code_name 身份名稱不可為空值'))
  const newIdentity = await Identities.create(postData);
  await User.findByIdAndUpdate(req.user._id, { 
    current_identity: newIdentity._id
  }, { new: true });
  handleSuccessRes(res, newIdentity, '新增成功');
}));

// 更新單筆身份
router.patch('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const { id } = req.params;
  const postData = { 
    ...req.body,
    user: req.user._id
  }
  if (Object.keys(postData).length === 0) return next(appError(400, '未取得更新資料'))
  if (postData.code_name) postData.code_name = postData.code_name.trim()
  if (postData.name) postData.name = postData.name.trim()
  const identity = await Identities.findById(id).populate({ path: 'user', select: 'id' });
  if (identity.user._id.toString() !== req.user._id.toString()) return next(appError(403, '無權限更改此篇身份'))
  const updatedPost = await Identities.findByIdAndUpdate(id, postData, { new: true });
  handleSuccessRes(res, updatedPost, '更新成功');
}));

// 刪除單筆身份
router.delete('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
  // #swagger.tags = ['身份 Identities']
  const { id } = req.params;
  const identity = await Identities.findById(id).populate({ path: 'user', select: 'id' });
  if (identity.user._id.toString() !== req.user._id.toString()) return next(appError(403, '無權限刪除此篇身份'))
  const result = await Identities.findByIdAndDelete(id);
  if (!result) return next(appError(400, `查無此身份ID:${id}`))
  await User.findByIdAndUpdate(req.user._id, { 
    current_identity: req.user.main_identity._id
  });
  handleSuccessRes(res, result, '刪除成功');
}));

module.exports = router;