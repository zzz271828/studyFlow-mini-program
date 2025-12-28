const db = wx.cloud.database();

// Helper functions for time calculation
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function buildTimes(openTime, closeTime, stepMinutes = 30) {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const list = [];
  for (let t = start; t <= end; t += stepMinutes) {
    list.push(minutesToTime(t));
  }
  return list;
}

function filterEndTimes(allTimes, startTime) {
  const start = timeToMinutes(startTime);
  return allTimes.filter(t => timeToMinutes(t) > start);
}

Page({
  data: {
    roomId: null,
    room: {},
    seats: [],
    selectedSeatId: null,
    showTimePicker: false,
    timeColumns: [[], []],
    timeIndex: [0, 0],
    selectedStartTime: null,
    selectedEndTime: null,
    loading: true
  },

  async onLoad(options) {
    const roomId = options.roomId || "ecf92658694f674c01208de639c4c735"; // Fallback to your demo ID
    console.log('[room.onLoad] roomId =', roomId);
    
    this.setData({ roomId });
    await this.loadRoomFromDB(roomId);
  },

  async loadRoomFromDB(roomId) {
    wx.showLoading({ title: '加载中...' });
    try {
      // 1. Fetch Room Details
      const res = await db.collection('rooms').doc(roomId).get();
      const room = res.data;
      console.log('[loadRoomFromDB] room found:', room);

      // 2. Fetch Seats
      let seatRes = await db.collection('roomSeats').where({ roomId }).get();
      console.log('[loadRoomFromDB] initial seat count:', seatRes.data.length);

      // 3. AUTO-SEED: If no seats exist, call your cloud function automatically
      if (seatRes.data.length === 0) {
        console.log('[loadRoomFromDB] No seats found. Seeding now...');
        wx.showLoading({ title: '正在初始化座位...' });
        
        await wx.cloud.callFunction({
          name: 'seedRoomSeats',
          data: { roomId, seatCount: room.seatCount || 20 }
        });
        
        // Fetch again after seeding
        seatRes = await db.collection('roomSeats').where({ roomId }).get();
      }

      // 4. Setup Time Picker
      const openT = room.openTime || '09:00';
      const closeT = room.closeTime || '18:00';
      const step = room.timeStep || 30;
      const allTimes = buildTimes(openT, closeT, step);
      const startTimes = allTimes.slice(0, -1);
      const defaultStart = startTimes[0];
      const endTimes = filterEndTimes(allTimes, defaultStart);

      this.setData({
        room,
        seats: seatRes.data.map(s => ({
          id: s.seatId,
          label: s.label,
          status: 'free'
        })),
        timeColumns: [startTimes, endTimes],
        timeIndex: [0, 0],
        selectedStartTime: defaultStart,
        selectedEndTime: endTimes[0] || null,
        loading: false
      });

    } catch (err) {
      console.error('[loadRoomFromDB] failed:', err);
      wx.showToast({ title: '房间加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
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

    const selected = updatedSeats.find(s => s.status === 'selected');
    this.setData({
      seats: updatedSeats,
      selectedSeatId: selected ? selected.id : null,
      showTimePicker: !!selected
    });
  },

  onTimeColumnChange(e) {
    const { column, value } = e.detail;
    const [startTimes] = this.data.timeColumns;

    if (column === 0) {
      const newStart = startTimes[value];
      const allTimes = buildTimes(this.data.room.openTime, this.data.room.closeTime, this.data.room.timeStep);
      const newEndTimes = filterEndTimes(allTimes, newStart);

      this.setData({
        timeColumns: [startTimes, newEndTimes],
        timeIndex: [value, 0],
        selectedStartTime: newStart,
        selectedEndTime: newEndTimes[0] || null
      });
    } else {
      const idx = [...this.data.timeIndex];
      idx[1] = value;
      this.setData({
        timeIndex: idx,
        selectedEndTime: this.data.timeColumns[1][value]
      });
    }
  },

  onConfirm() {
    wx.showModal({
      title: '确认预约',
      content: `座位: ${this.data.selectedSeatId}\n时间: ${this.data.selectedStartTime} - ${this.data.selectedEndTime}`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '预约成功' });
        }
      }
    });
  }
});