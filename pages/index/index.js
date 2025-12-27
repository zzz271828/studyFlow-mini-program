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
      console.log('rooms from db:', res.data); 
  
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
});
