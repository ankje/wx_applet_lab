Page({
  data: {
  },
  toPage: function(e) {
    wx.navigateTo({
		url: e.currentTarget.dataset.url
	})
  }
})