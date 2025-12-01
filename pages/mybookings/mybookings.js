// pages/mybookings/mybookings.js
Page({
  data: {
    bookings: []
  },

  onShow() {
    const bookings = wx.getStorageSync('bookings') || [];
    bookings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    this.setData({ bookings });

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1);
    }
  }
});
