// index.js
const app = getApp();

Page({
  data: {
    rooms: []
  },

  onLoad() {
    this.setData({
      rooms: app.globalData.rooms
    });
  },

  onShow() {
    // 告诉自定义 tabBar：当前是第 0 个 tab（自习室）
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0);
    }
  },

  onRoomTap(event) {
    const roomId = event.currentTarget.dataset.roomId;
    wx.navigateTo({
      url: `/pages/room/room ? roomId=${roomId}`
    });
  }
});

