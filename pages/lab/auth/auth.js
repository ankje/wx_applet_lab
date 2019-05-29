const WXAPI = require('../wxapi/main')
Page({
  data: {
  },
  //事件处理函数
	//登录并获取session
	bandLoginAndGetSession:function(){
		//微信内置的登录
		wx.login({
		  success: res => {
				let code = res.code
				console.log('微信临时code:',code)				
				//获取用户信息
				wx.getUserInfo({
					success: (res) => {
						console.log('微信用户信息：',res)		
						let postData = {
							nickname:res.userInfo.nickName,
							avatar:res.userInfo.avatarUrl,
							unique_id:code,
							wxApplet:{
								iv:res.iv,
								encryptedData:res.encryptedData
							}
						}
						console.log('后台登录请求参数：',postData)
						WXAPI.postOauth(postData)
						.then(res=>{
								console.log('后台登录返回结果：',res)
						})
					}
				})
		  }
		})
	},
  onLoad: function () {
  },
})
