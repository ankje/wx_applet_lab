const app = getApp()
Page({
	data: {
	},
	onLoad: function () {
	},
	initWs:function(e){
		app.globalData.ws=wx.connectSocket({
		  url: 'wss://testsocket.natao.net',
		  header:{
			'module':'SwooleVideoChat',
			'content-type': 'application/json'
		  },
		  //protocols: ['protocol1'],
		  method:"GET"
		})
		
		app.globalData.ws.onOpen(function(header){
			console.log('客户端：这边连接打开了',header)
		})
				
		app.globalData.ws.onMessage(function(res){
			console.log('客户端：收到你的消息了',res)
		})	
		
		app.globalData.ws.onClose(function(res){
			console.log('客户端：这边连接断开了',res)
		})
	},
	sendMsg:function(){
		let msg = JSON.stringify({
				a:111,
				b:2222
			})
		console.log('客户端：'+msg)
		app.globalData.ws.send({
			data:msg,
			success:function(){},
			fail:function(){}
		})
	},
	close:function(){
		app.globalData.ws.close({
			code:1000,
			reason:'我这边客户端要关闭了',
			success:function(){},
			fail:function(){}
		})
	}
})
