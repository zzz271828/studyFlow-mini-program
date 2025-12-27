// pages/room/room.js
const app = getApp();

function generateSeats() {
  const seats = [];
  const rows = ['A', 'B'];
  rows.forEach(r => {
    for (let i = 1; i <= 10; i++) {
      const id = `${r}${i}`;
      seats.push({ id, label: id, status: 'free' });
    }
  });
  return seats;
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function buildTimeSlots(openTime, closeTime, stepMinutes = 30, durationMinutes = 60) {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);

  const slots = [];
  for (let t = start; t + durationMinutes <= end; t += stepMinutes) {
    const s = minutesToTime(t);
    const e = minutesToTime(t + durationMinutes);
    slots.push(`${s} - ${e}`);
  }
  return slots;
}

Page({
  data: {
    room: {},
    seats: [],
    selectedSeatId: null,
    selectedTimeRange: null,
    timeSlots: [],
    showTimePicker: false,
    timeSlotIndex: 0
  },

  onLoad() {
    const room = app.globalData.room || {};
    const openTime = room.openTime || '08:00';
    const closeTime = room.closeTime || '22:00';

    const timeSlots = buildTimeSlots(openTime, closeTime, 30, 60);

    this.setData({
      room,
      seats: generateSeats(),
      timeSlots
    });
  },

  onSeatTap(e) {
    const seatId = e.currentTarget.dataset.seatId;

    const updatedSeats = this.data.seats.map(seat => {
      if (seat.id === seatId) {
        const newStatus = seat.status === 'selected' ? 'free' : 'selected';
        return { ...seat, status: newStatus };
      }
      return { ...seat, status: 'free' };
    });

    const selected = updatedSeats.find(seat => seat.status === 'selected');

    if (!selected) {
      this.setData({
        seats: updatedSeats,
        selectedSeatId: null,
        selectedTimeRange: null
      });
      return;
    }

    this.setData({
      seats: updatedSeats,
      selectedSeatId: selected.id,
      selectedTimeRange: null
    });

    this.pickTimeSlot();
  },

  pickTimeSlot() {
    const slots = this.data.timeSlots;
    console.log('pickTimeSlot called, slots =', slots);

    if (!slots || slots.length === 0) {
      wx.showToast({ title: '暂无可预约时间', icon: 'none' });
      return;
    }
    this.setData({ showTimePicker: true});

    wx.showActionSheet({
      itemList: slots,
      success: (res) => {
        this.setData({ selectedTimeRange: slots[res.tapIndex] });
        wx.showToast({ title: '已选择时间', icon: 'success' });
      },
      fail: (err) => {
        console.log('actionSheet cancelled/fail', err);
      }
    });
  },

  onConfirm() {
    if (!this.data.selectedSeatId) {
      wx.showToast({ title: '请先选择一个座位', icon: 'none' });
      return;
    }

    if (!this.data.selectedTimeRange) {
      wx.showToast({ title: '请选择预约时间', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '预约信息确认',
      content:
        `房间：${this.data.room.name || '未命名房间'}\n` +
        `地址：${this.data.room.location || ''}\n` +
        `座位：${this.data.selectedSeatId}\n` +
        `时间：${this.data.selectedTimeRange}\n\n` +
        `(当前仍是前端模拟，尚未写入后台)`,
      showCancel: false
    });
  },

  onTimeChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      timeSlotIndex: idx,
      selectedTimeRange: this.data.timeSlots[idx]
    });
  },
  
  onCloseTimePicker() {
    this.setData({ showTimePicker: false });
  }
  
});
