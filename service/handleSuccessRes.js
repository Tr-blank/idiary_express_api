const headers = require('../service/headersSetting');

function handleSuccessRes(res, data = [], message = '成功') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 200,
        data,
        message
      })
    );
    res.end();
  }
  
  module.exports = handleSuccessRes;
  