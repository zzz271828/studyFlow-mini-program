// pages/index/index.js
const db = wx.cloud.database();

Page({
  data: {
    rooms: [],
    loading: true
  },

  onLoad() {
    this.loadRooms();
  },

  onPullDownRefresh() {
    this.loadRooms(true);
  },

  async loadRooms(isPullDown = false) {
    this.setData({ loading: true });

    try {
      const res = await db.collection('rooms').get();
      this.setData({
        rooms: res.data || [],
        loading: false
      });
    } catch (err) {
      console.error('loadRooms failed:', err);
      wx.showToast({ title: '加载自习室失败', icon: 'none' });
      this.setData({ loading: false });
    } finally {
      if (isPullDown) wx.stopPullDownRefresh();
    }
  },

  onRoomTap(e) {
    // IMPORTANT: matches data-room-id in your WXML
    const roomId = e.currentTarget.dataset.roomId;
    if (!roomId) {
      wx.showToast({ title: '缺少 roomId', icon: 'none' });
      return;
    }

    // IMPORTANT: must use backticks OR string concat
    wx.navigateTo({
      url: `/pages/room/room?roomId=${encodeURIComponent(roomId)}`
    });
  }
});
