// pages/room/room.js
const app = getApp();

Page({
  data: {
    room: {},
    // fcking demo
    seats: [
      { id: 'A1', label: 'A1', status: 'free' },
      { id: 'A2', label: 'A2', status: 'free' },
      { id: 'B1', label: 'B1', status: 'free' },
      { id: 'B2', label: 'B2', status: 'free' }
    ],
    selectedSeatId: null
  },

  onLoad() {
    // 从全局拿那一间房的 info
    this.setData({
      room: app.globalData.room
    });
  },

  onSeatTap(e) {
    const seatId = e.currentTarget.dataset.seatId;

    // 遍历 4 个座位，只有一个是 selected，其它都是 free
    const updatedSeats = this.data.seats.map(seat => {
      if (seat.id === seatId) {
        // 点击当前：在 selected 和 free 之间切换
        const newStatus = seat.status === 'selected' ? 'free' : 'selected';
        return { ...seat, status: newStatus };
      } else {
        // 其它座位全部变成 free
        return { ...seat, status: 'free' };
      }
    });

    // 找一下当前是否真有选中的座位
    const selected = updatedSeats.find(seat => seat.status === 'selected');

    this.setData({
      seats: updatedSeats,
      selectedSeatId: selected ? selected.id : null
    });
  },

  onConfirm() {
    if (!this.data.selectedSeatId) {
      wx.showToast({
        title: '请先选择一个座位',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '选座成功',
      content: `你选择了座位：${this.data.selectedSeatId}\n (当前只是示例, 不会真正写入后台)`,
      showCancel: false
    });
  }
});
