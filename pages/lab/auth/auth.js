const WXAPI = require('../wxapi/main')
const app = getApp()
const fun = require('../wxapi/fun')
Page({
	data: {},
	//事件处理函数
	//登录并获取session
	bandLoginAndGetSession: function() {
		//微信内置的登录
		wx.login({
			success: res => {
				let code = res.code
				console.log('微信临时code:', code)
				fun.showModal('微信临时code:'+code)
				//获取用户信息
				wx.getUserInfo({
					success: (res) => {
						console.log('微信用户信息：', res)								
						fun.showModal('微信用户信息：'+JSON.stringify(res))
						let postData = {
							nickname: res.userInfo.nickName,
							avatar: res.userInfo.avatarUrl,
							unique_id: code,
							wxApplet: {
								iv: res.iv,
								encryptedData: res.encryptedData
							}
						}
						console.log('后台登录请求参数：', postData)													
						fun.showModal('后台登录请求参数：'+JSON.stringify(postData))
						WXAPI.postOauth(postData)
							.then(res => {
								console.log('后台登录返回结果：', res)								
								// fun.showModal('后台登录返回结果：'+JSON.stringify(res))
								app.globalData.user = res.data;
							})
					},
					fail:(res)=>{
						wx.getSetting({
							success(res) {
								if (!res.authSetting['scope.userInfo']) {											
									fun.showModal('没有权限获取用户信息, 请授权后重新操作')
									wx.authorize({
										scope: 'scope.userInfo',
										success () {								
											fun.showModal('请求授权成功')
										},
										fail(){										
											fun.showModal('请求授权失败')
											wx.openSetting({
												success (res) {}
											})
										}
									})
								}
							}
						})
						fun.showModal('获取微信用户信息失败：'+JSON.stringify(res))
					}
				})
			}
		})
	},
	onLoad: function() {},
})
