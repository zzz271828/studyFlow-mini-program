// pages/room/room.js
const app = getApp();

/**
 * generate 20 seats, with the number A1 - A10, B1 - B10
 */
function generateSeats() {
  const seats = [];
  const row = ['A', 'B'];

  rows.forEach(row => {
    const id = '${row}${i}';
    seats.push({ id, label: id, status: 'free'});
  });
  return seats;
}

/**
 * convert HH;MM into minuts
 */
function minutsToTime(mins) {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');

  return '${h}:${m}';
}

/**
 * generate pickable time according to the opening time.
 * 30 min as one time interval
 */
function buildTimeSlots(openTime, closeTime, stepMinuts = 30, durationMinuts = 60) {
  const start = timeMinuts(openTime);
  const end = tiemToMinuts(closeTime);

  const slots = [];

  for (let t = start; t + durationMinuts <= end; t += stepMinuts) {
    const s = minutsToTime(t);
    const e = minutsToTime(t + durationMinuts);
    slots.push('${s} - ${e}');
  }

  return slots;
}
Page({
  data: {
    room: {},

    seats: [],

    selectedSeatsId: null,

    selectedTimeRange:null,

    timeSlots:[]
  },

  onLoad() {
    const room = app.globalData.room || {};

    const openTime = room.openTime || '08:00';
    const closeTime = room.closeTime || '22:00';

    const timeSlots = buildTimeSlots(openTime, closeTime, 30, 60);

    this.setData( {
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
      } else {
        return { ...seat, status: 'free' };
      }
    });

    // 找一下当前是否真有选中的座位
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

    if(!slots || slots.length === 0) {
      wx.showToast({ title: '暂无可预约时间', icon: 'none'});
    }

    wx.showActionSheet({
      itemList: slots,
      success: (res) => {
        const idx = res.tapIndex;
        this.setData({
          selectedTimeRange: slots[idx]
        });
      },
      fail: () => {

      }
    })
  },


  onConfirm() {
    if (!this.data.selectedSeatId) {
      wx.showToast({
        title: '请先选择一个座位',
        icon: 'none'
      });
      return;
    }

    if (!this.data.selectedTimeRane) {
      wx.showToast ({
        title: '请选择预约时间',
        icon: 'none'
      });

      return;
    }

    wx.showModal({
      title: '预约信息确认',
      content:
        `房间：${this.data.room.name || '未命名房间'}\n` +
        `座位：${this.data.selectedSeatId}\n` +
        `时间：${this.data.selectedTimeRange}\n\n` +
        `(当前仍是前端模拟，尚未写入后台)`,
      showCancel: false
    });
  }
});
