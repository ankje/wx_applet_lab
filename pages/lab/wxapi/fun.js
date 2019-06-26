module.exports = {
	showModal(content) {
		wx.showModal({
			title: '提示',
			content: content,
			success(res) {
				if (res.confirm) {
					console.log('用户点击确定')
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	showToast(content) {
		wx.showToast({
			title: content,
			icon: 'none',
			duration: 2000
		})
	}
}
