const appError = (httpStatus, errorMessage)=>{
  const error = new Error(errorMessage);
  error.statusCode = httpStatus;
  error.isOperational = true; // 是否是預期內的錯誤
  return error
}

module.exports = appError;
