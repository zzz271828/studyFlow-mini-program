// pages/index/index.js
Page({
  data: {
    rooms: [
      {
        id: 1,
        name: "Hargrave Andrew Library",
        location: "13 Collage Walk",
        openTime: "10:00",
        closeTime: "18:00",
        availableSeats: 64
      },
      {
        id: 2,
        name: "LTB",
        location: "19 Ancora Imparo Wy",
        openTime: "09:00",
        closeTime: "18:00",
        availableSeats: 512
      },
      {
        id: 3,
        name: "slm 24/7",
        location: "Foyer/40 Exhibition Walk",
        openTime: "00:00",
        closeTime: "24:00",
        availableSeats: 1024
      }
    ]
  },

  onRoomTap(e) {
    const roomId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/room/room?id=${roomId}`
    });
  }
});
