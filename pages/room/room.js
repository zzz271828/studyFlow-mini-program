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

// Build a list like ["09:00","09:30",...,"18:00"]
function buildTimes(openTime, closeTime, stepMinutes = 30) {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const list = [];
  for (let t = start; t <= end; t += stepMinutes) {
    list.push(minutesToTime(t));
  }
  return list;
}

// End times must be strictly after start time
function filterEndTimes(allTimes, startTime) {
  const start = timeToMinutes(startTime);
  return allTimes.filter(t => timeToMinutes(t) > start);
}

Page({
  data: {
    room: {},
    seats: [],
    selectedSeatId: null,

    // multi-wheel time picker
    showTimePicker: false,
    timeColumns: [[], []], // [startTimes, endTimes]
    timeIndex: [0, 0],
    selectedStartTime: null,
    selectedEndTime: null
  },

  onLoad() {
    const room = app.globalData.room || {};
    const openTime = room.openTime || '08:00';
    const closeTime = room.closeTime || '22:00';

    const allTimes = buildTimes(openTime, closeTime, 30);

    // Start times can't be the last one (can't start at closing time)
    const startTimes = allTimes.slice(0, -1);

    const defaultStart = startTimes[0];
    const endTimes = filterEndTimes(allTimes, defaultStart);

    this.setData({
      room,
      seats: generateSeats(),
      timeColumns: [startTimes, endTimes],
      timeIndex: [0, 0],
      selectedStartTime: defaultStart,
      selectedEndTime: endTimes[0] || null
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
        showTimePicker: false
      });
      return;
    }

    this.setData({
      seats: updatedSeats,
      selectedSeatId: selected.id
    });

    // open time picker
    this.pickTimeSlot();
  },

  pickTimeSlot() {
    this.setData({ showTimePicker: true });
  },

  onCloseTimePicker() {
    this.setData({ showTimePicker: false });
  
    if (this.data.selectedSeatId && this.data.selectedStartTime && this.data.selectedEndTime) {
      wx.showToast({
        title: `${this.data.selectedSeatId} ${this.data.selectedStartTime}-${this.data.selectedEndTime}`,
        icon: 'none',
        duration: 2000
      });
    }
  },
  

  // Fires when user scrolls a column
  onTimeColumnChange(e) {
    const { column, value } = e.detail;
    const [startTimes] = this.data.timeColumns;

    // If start column changes, rebuild end column
    if (column === 0) {
      const newStart = startTimes[value];

      const openTime = this.data.room.openTime || '08:00';
      const closeTime = this.data.room.closeTime || '22:00';
      const allTimes = buildTimes(openTime, closeTime, 30);
      const newEndTimes = filterEndTimes(allTimes, newStart);

      this.setData({
        timeColumns: [startTimes, newEndTimes],
        timeIndex: [value, 0],
        selectedStartTime: newStart,
        selectedEndTime: newEndTimes[0] || null
      });
      return;
    }

    // end column scrolled (keep current start)
    const [, endTimes] = this.data.timeColumns;
    const idx = [...this.data.timeIndex];
    idx[column] = value;

    this.setData({
      timeIndex: idx,
      selectedEndTime: endTimes[value]
    });
  },

  // Fires when user confirms multiSelector
  onTimeChange(e) {
    const [startIdx, endIdx] = e.detail.value;
    const [startTimes, endTimes] = this.data.timeColumns;
  
    const selectedStartTime = startTimes[startIdx];
    const selectedEndTime = endTimes[endIdx];
  
    this.setData({
      timeIndex: [startIdx, endIdx],
      selectedStartTime,
      selectedEndTime
    });
  
    wx.showToast({
      title: '时间已选择',
      icon: 'success'
    });
  },

  onConfirm() {
    if (!this.data.selectedSeatId) {
      wx.showToast({ title: '请先选择一个座位', icon: 'none' });
      return;
    }

    if (!this.data.selectedStartTime || !this.data.selectedEndTime) {
      wx.showToast({ title: '请选择预约时间', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '预约信息确认',
      content:
        `房间：${this.data.room.name || '未命名房间'}\n` +
        `座位：${this.data.selectedSeatId}\n` +
        `时间：${this.data.selectedStartTime} - ${this.data.selectedEndTime}\n\n` +
        `(当前仍是前端模拟，尚未写入后台)`,
      showCancel: false
    });
  }
});
