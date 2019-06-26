const fun = require('../wxapi/fun')
Page({
	data: {},
	onLoad() {
		console.log('下载文件...')
		wx.downloadFile({
			url: "https://testlt.natao.net/admin/pdf.pdf",
			success(res) {
				console.log(res)
				var filePath = res.tempFilePath;
				// wx.openDocument({
				// 	filePath: filePath,
				// 	success: function(res) {
				// 		console.log('打开文档成功')
				// 	},
				// 	fail: function(res) {
				// 		console.log(res);
				// 	}
				// })
				wx.saveFile({
					tempFilePath: filePath,
					success(res) {
							const savedFilePath = res.savedFilePath
							fun.showModal('保存文件成功，保存位置：' + savedFilePath)
					},
					fail(res) {
						console.log(res)
					}
				})
			},
			fail(res) {
				console.log(res)
			}
		})
	}
})
