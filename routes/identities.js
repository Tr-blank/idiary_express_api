const express = require('express');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccessRes = require('../service/handleSuccessRes');
const { isAuth } = require('../service/auth');
const Identities = require('../models/identity');
const User = require('../models/user')
const router = express.Router();

// 取得所有身份
router.get('/', handleErrorAsync(async (req, res, next) => {
  const { sort, keyword } = req.query;
  const timeSort = sort == 'asc' ? 'createdAt':'-createdAt'
  const query = keyword ? { content: new RegExp(req.query.keyword) } : {};
  const identities = await Identities.find(query).populate({
      path: 'user',
      select: 'account'
    }).sort(timeSort);
  handleSuccessRes(res, identities, '取得成功');
}));

// 取得單筆身份
router.get('/:id', handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const identities = await Identities.findById(id).populate({
      path: 'user',
      select: 'account'
    });
    handleSuccessRes(res, identities, '取得成功');
}));

// 新增單筆身份
router.post('/', isAuth, handleErrorAsync(async (req, res, next) => {
    const postData = { 
      ...req.body,
      user: req.user._id
    }
    if (postData.code_name) postData.code_name = postData.code_name.trim()
    if (postData.code_name === '') return next(appError(400, 'code_name 身份代號不可為空值'))
    if (postData.name) postData.name = postData.name.trim()
    if (postData.name === '') return next(appError(400, 'code_name 身份名稱不可為空值'))
    const newPost = await Identities.create(postData);
    handleSuccessRes(res, newPost, '新增成功');
}));

// 更新單筆身份
router.patch('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const postData = { 
      ...req.body,
      user: req.user._id
    }
    if (Object.keys(postData).length === 0) return next(appError(400, '未取得更新資料'))
    if (postData.code_name) postData.code_name = postData.code_name.trim()
    if (postData.code_name === '') return next(appError(400, 'code_name 身份代號不可為空值'))
    if (postData.name) postData.name = postData.name.trim()
    if (postData.name === '') return next(appError(400, 'code_name 身份名稱不可為空值'))
    const identities = await Identities.findById(id).populate({ path: 'user', select: 'id' });
    if (identities.user.id !== req.user._id) return next(appError(403, '無權限更改此篇身份'))
    const updatedPost = await Identities.findByIdAndUpdate(id, postData, { new: true });
    handleSuccessRes(res, updatedPost, '更新成功');
}));

// 刪除單筆身份
router.delete('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const identities = await Identities.findById(id).populate({ path: 'user', select: 'id' });
    if (Identities.user.id !== req.user._id) return next(appError(403, '無權限刪除此篇身份'))
    const result = await Identities.findByIdAndDelete(id);
    if (!result) return next(appError(400, `查無此身份ID:${id}`))
    handleSuccessRes(res, result, '刪除成功');
}));

module.exports = router;