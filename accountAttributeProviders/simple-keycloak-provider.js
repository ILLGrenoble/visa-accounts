const getUserId = function (userInfo) {
  return userInfo.get('the_userid_claim')
}

const getAccountParameters = function (userInfo) {
  return   {
    "homePath": userInfo.get("homeDirectory")
  }
}


module.exports = {
  getUserId: getUserId,
  getAccountParameters: getAccountParameters,
};
