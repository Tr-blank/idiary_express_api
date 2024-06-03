const express = require('express');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const handleSuccessRes = require('../service/handleSuccessRes');
const { isAuth } = require('../service/auth');
const Diaries = require('../models/diary');
const Identities = require('../models/identity');
const User = require('../models/user')
const router = express.Router();

// 取得所有日記
router.get('/', handleErrorAsync(async (req, res, next) => {
  const { sort, keyword } = req.query;
  const timeSort = sort == 'asc' ? 'createdAt':'-createdAt'
  const query = keyword ? { content: new RegExp(req.query.keyword) } : {};
  const diaries = await Diaries.find(query).populate({
    path: 'user',
    select: 'account'
  }).populate({
    path: 'identity',
    select: 'account name avatar'
  }).sort(timeSort);
  handleSuccessRes(res, diaries, '取得成功');
}));

// 取得單筆日記
router.get('/:id', handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const diaries = await Diaries.findById(id).populate({
      path: 'user',
      select: 'account'
    }).populate({
      path: 'identity',
      select: 'account name avatar'
    });
    handleSuccessRes(res, diaries, '取得成功');
}));

// 新增單筆日記
router.post('/', isAuth, handleErrorAsync(async (req, res, next) => {
    const postData = { 
      ...req.body,
      user: req.user.id,
      content: req.body.content.trim()
    }
    if (postData.content === '') return next(appError(400, 'content 日記內容不可為空值'))
    const newPost = await Diaries.create(postData);
    handleSuccessRes(res, newPost, '新增成功');
}));

// 更新單筆日記
router.patch('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const postData = { 
      ...req.body,
      user: req.user.id,
      content: req.body.content.trim()
    }
    if (Object.keys(postData).length === 0) return next(appError(400, '未取得更新資料'))
    if (postData.content) postData.content = postData.content.trim()
    if (postData.content === '') return next(appError(400, 'content 日記內容不可為空值'))
    const diaries = await Diaries.findById(id).populate({ path: 'user', select: 'id' });
    if (diaries.user.id !== req.user.id) return next(appError(403, '無權限更改此篇日記'))
    const updatedPost = await Diaries.findByIdAndUpdate(id, postData, { new: true });
    handleSuccessRes(res, updatedPost, '更新成功');
}));

// 刪除單筆日記
router.delete('/:id', isAuth, handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const diaries = await Diaries.findById(id).populate({ path: 'user', select: 'id' });
    if (diaries.user.id !== req.user.id) return next(appError(403, '無權限刪除此篇日記'))
    const result = await Diaries.findByIdAndDelete(id);
    if (!result) return next(appError(400, `查無此日記ID:${id}`))
    handleSuccessRes(res, result, '刪除成功');
}));

module.exports = router;