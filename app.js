const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const identitiesRouter = require('./routes/identities');
const diariesRouter = require('./routes/diaries');

const isDev = process.env.NODE_ENV.trim() === 'dev'
dotenv.config({ path: './config.env' })

// 程式出現重大錯誤時
process.on('uncaughtException', error => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(error.name);
  console.error(error.message);
  if(isDev) console.error(error.stack); //只能在dev出現，不可再main出現
	process.exit(1);
});

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB) // 連線資料庫
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/identities', identitiesRouter);
app.use('/diaries', diariesRouter);

// 404 查無此路由
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: '查無此路由',
  });
});

// 自己設定的 express 錯誤顯示
// 開發環境錯誤 function
const resErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    error,
    stack: error.stack
  });
};
// 正式環境錯誤 function
const resErrorProd = (error, res) => {
  if (error.isOperational) { // 是預期內錯誤
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message
    });
  } else {
    console.error('出現非預期錯誤', error);
    // 對外顯示
    res.status(500).json({
      status: 500,
      message: '系統錯誤，請恰系統管理員'
    });
  }
};

// 統一管理錯誤顯示
app.use((error, req, res, next) => {
  // dev
  error.statusCode = error.statusCode || 500;
  if (isDev) {
    return resErrorDev(error, res);
  } 
  // production mongoose
  if (error.name === 'ValidationError' || error.name === 'CastError'){
    error.message = '資料欄位未填寫正確，請重新輸入！'
    error.isOperational = true;
    return resErrorProd(error, res)
  }
  resErrorProd(error, res)
});


// 未捕捉到的 catch 
process.on('unhandledRejection', (error, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', error);
});

module.exports = app;
