const wxapi = require('../wxapi/main')
const fun = require('../wxapi/fun')
const app = getApp()
Page({
	data: {
		room:{
			room_id:0,
			to_user_id: 166,
			srv_vc_id: 1,
		},
		info: '',
		wsModule: 'SwooleVideoChat',
		isDoctor: false,
		ws_actions: {
			joinRoom: 'joinRoom', //进入房间
			getRoomInfo: 'getRoomInfo', //获取房间信息
			leaveRoom: 'leaveRoom', //离开房间
		},
		isPublishBegin: false, //是否已经开始推流
		isPlayBegin: false, //是否已经开始播放
		videoChatAppUrl: 'rtmp://39.108.58.88:1935/video_chat/',
		pushUrl: '',
		playSrc: '',
	},
	onLoad: function() {
		let that = this
		that.setData({
			isDoctor: app.globalData.user.identity == 'doctor' ? true : false
		})
		
		//心跳
		setInterval(function(){that.sendMsg({})},50000)
	},
	//加入房间（接听方）
	joinRoom: function() {
		let that = this
		that.initWs()
		app.globalData.ws.onOpen(function(header) {
			that.sendMsg({
				module: that.data.wsModule,
				action: that.data.ws_actions.joinRoom,
				data: {
					room_id: that.data.room.room_id,
					api_token: app.globalData.user.api_token,
				}
			})
		})		
	},
	//呼叫，返回room_id。(呼叫方)
	call: function(e) {
		let that = this
		wxapi.call({
				api_token: app.globalData.user.api_token,
				to_user_id: that.data.room.to_user_id,
				srv_vc_id: that.data.room.srv_vc_id,
			})
			.then(res => {
				console.log('后台返回结果：', res)
				that.data.room.room_id = res.data.room_id
				that.setData({
					room:that.data.room
				})
				//取得房间后，初始ws，进入房间
				that.initWs()
				app.globalData.ws.onOpen(function(header) {
					console.log('客户端：这边连接打开了', header)

					//进入房间
					that.sendMsg({
						module: that.data.wsModule,
						action: that.data.ws_actions.joinRoom,
						data: {
							room_id: that.data.room.room_id,
							api_token: app.globalData.user.api_token,
						}
					})
				})
			})
	},
	initWs: function() {
		let that = this
		app.globalData.ws = wx.connectSocket({
			url: 'wss://testsocket.natao.net',
			header: {
				'module': 'SwooleVideoChat',
				'content-type': 'application/json'
			},
			//protocols: ['protocol1'],
			method: "GET"
		})

		app.globalData.ws.onMessage(function(res) {
			try {
				res = JSON.parse(res.data)
			} catch (e) {
				// console.log(e)
			}
			console.log('客户端：收到你的消息了', res)
			switch (res.action) {
				case that.data.ws_actions.joinRoom:
					if (that.data.isDoctor) {
						if (res.data.user_cnt == 2) {
							//当收到对方准备就绪时，就开始推送视频
							//接收反推流
							that.setData({
								pushUrl: that.data.videoChatAppUrl + 'D2P_' + res.data.doctor_id + '_' + res.data.patient_id +
									'?api_token=' + app.globalData.user.api_token + '&room_id=' + that.data.room.room_id
							})
							that.pusherStart()
							that.setData({
								playSrc: that.data.videoChatAppUrl + 'P2D_' + res.data.patient_id + '_' + res.data.doctor_id +
									'?api_token=' + app.globalData.user.api_token + '&room_id=' + that.data.room.room_id
							})
							that.playerPlay()
							// console.log('pushUrl:',that.data.pushUrl)
							// console.log('playSrc:',that.data.playSrc)
						}
					} else {
						if (res.data.user_cnt == 2) {
							//当收到对方准备就绪时,就开始播放								
							//准备开始反推流							
							that.setData({
								pushUrl: that.data.videoChatAppUrl + 'P2D_' + res.data.patient_id + '_' + res.data.doctor_id +
									'?api_token=' + app.globalData.user.api_token + '&room_id=' + that.data.room.room_id
							})
							that.pusherStart()
							that.setData({
								playSrc: that.data.videoChatAppUrl + 'D2P_' + res.data.doctor_id + '_' + res.data.patient_id +
									'?api_token=' + app.globalData.user.api_token + '&room_id=' + that.data.room.room_id
							})
							that.playerPlay()
							// console.log('pushUrl:',that.data.pushUrl)
							// console.log('playSrc:',that.data.playSrc)
						}
					}
					break;
				case that.data.ws_actions.leaveRoom:
					if (that.data.isDoctor) {
						if (res.data.user_cnt != 2) {
							that.pusherStop()
							that.playerStop()
						}
					} else {
						if (res.data.user_cnt != 2) {
							that.pusherStop()
							that.playerStop()
						}
					}
					break;
			}
		})

		app.globalData.ws.onClose(function(res) {
			console.log('客户端：这边连接断开了', res)
			fun.showToast('连接断开了')
			wx.navigateBack({
			  delta: 1
			})
		})
	},
	sendMsg: function(jsonData) {
		let msg = JSON.stringify(jsonData)
		console.log('客户端：' + msg)
		app.globalData.ws && app.globalData.ws.send({
			data: msg,
			success: function() {},
			fail: function() {}
		})
	},
	onReady(res) {
		this.pusher = wx.createLivePusherContext('pusher')
		this.player = wx.createLivePlayerContext('player')
	},
	pusherStart() {
		this.pusher.start({
			success: res => {
				console.log('start success')
			},
			fail: res => {
				console.log('start fail')
			}
		})
	},
	pusherStop() {
		this.pusher.stop({
			success: res => {
				console.log('stop success')
			},
			fail: res => {
				console.log('stop fail')
			}
		})
	},
	playerPlay() {
		this.player.play({
			success: res => {
				console.log('play success')
			},
			fail: res => {
				console.log('play fail', res)
			}
		})
	},
	playerStop() {
		this.player.stop({
			success: res => {
				console.log('stop success')
			},
			fail: res => {
				console.log('stop fail')
			}
		})
	},
	hangUp() {
		let that = this
		that.pusherStop()
		that.playerStop()		
		that.sendMsg({
			module: that.data.wsModule,
			action: that.data.ws_actions.leaveRoom,
			data: {
				room_id: that.data.room.room_id,
				api_token: app.globalData.user.api_token,
			}
		})
	},
	inputedit: function (e) {
		// 1. input 和 info 双向数据绑定
		let dataset = e.currentTarget.dataset;
		//data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象，有obj和item属性，可以通过这两个实现双向数据绑定，通过更改这两个值，对不同name的变量赋值
		let value = e.detail.value;
		this.data[dataset.obj][dataset.item] = value;
		this.setData({
		  obj: this.data[dataset.obj]
		});
	  }
})
