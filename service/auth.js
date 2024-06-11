const jwt = require('jsonwebtoken');
const appError = require('../service/appError'); 
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../models/user');

  // 是否登入中
const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401,'你尚未登入！',next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve,reject)=>{
    jwt.verify(token,process.env.JWT_SECRET,(error, payload)=> error ? reject(error) : resolve(payload))
  })
  const currentUser = await User.findById(decoded.id);

  req.user = currentUser;
  next();
});

// 產生 JWT token
const generateSendJWT= (user, statusCode, res)=>{
  const token = jwt.sign({ id: user._id },process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data:{
      user: {
        token: token,
        account: user.account
      }
    }
  });
}

module.exports = { isAuth, generateSendJWT}
