const { v4: uuidv4 } = require("uuid");
const express = require('express');
const router = express.Router();
const handleSuccessRes = require('../service/handleSuccessRes');
const { isAuth } = require('../service/auth');
const upload = require('../service/image');
const firebaseAdmin = require('../service/firebase');
const bucket = firebaseAdmin.storage().bucket();

router.post('/avatar', upload, isAuth, (req, res) => {
  const file = req.files[0];
  // 基於檔案的原始名稱建立一個 blob 物件
  const blob = bucket.file(`idiary_images/avatar/${uuidv4()}.${file.originalname.split('.').pop()}`);
  // 建立一個可以寫入 blob 的物件
  const blobStream = blob.createWriteStream()
  // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
  blobStream.on('finish', () => {
    // 設定檔案的存取權限
    const config = {
      action: 'read', // 權限
      expires: '12-31-2500', // 網址的有效期限
    };
    // 取得檔案的網址
    blob.getSignedUrl(config, (err, imgUrl) => {
      handleSuccessRes(res, { imgUrl }, '上傳成功');
    });
  });
  // 如果上傳過程中發生錯誤，會觸發 error 事件
  blobStream.on('error', (err) => {
    res.status(500).send('上傳失敗');
  });
  // 將檔案的 buffer 寫入 blobStream
  blobStream.end(file.buffer);
});

router.post('/photo', upload, isAuth, (req, res) => {
  const file = req.files[0];
  // 基於檔案的原始名稱建立一個 blob 物件
  const blob = bucket.file(`idiary_images/photo/${uuidv4()}.${file.originalname.split('.').pop()}`);
  // 建立一個可以寫入 blob 的物件
  const blobStream = blob.createWriteStream()
  // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
  blobStream.on('finish', () => {
    // 設定檔案的存取權限
    const config = {
      action: 'read', // 權限
      expires: '12-31-2500', // 網址的有效期限
    };
    // 取得檔案的網址
    blob.getSignedUrl(config, (err, imgUrl) => {
      handleSuccessRes(res, { imgUrl }, '上傳成功');
    });
  });
  // 如果上傳過程中發生錯誤，會觸發 error 事件
  blobStream.on('error', (err) => {
    res.status(500).send('上傳失敗');
  });
  // 將檔案的 buffer 寫入 blobStream
  blobStream.end(file.buffer);
});

module.exports = router;
