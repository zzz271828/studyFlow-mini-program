// pages/mybookings/mybookings.js
Page({
  data: {
    bookings: []
  },

  onShow() {
    const bookings = wx.getStorageSync('bookings') || [];
    bookings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    this.setData({ bookings });

    // 告诉自定义 tabBar：当前是第 1 个 tab（我的预约）
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1);
    }
  }
});
