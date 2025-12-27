// app.js
App({
  onLaunch() {
    console.log('StudyFlow mini program lauched');
  },

  globalData: {
    // TODO: store the value shared by all the pages
    room: {
      id: 'room-demo',
      name: 'Hargrave Andrew Library',
      location: '13 College Walk',
      todaySeats: 20,
      openTime: '09:00',
      closeTime: '18:00',
      description: 'demo room, for demostration purpose ONLY. showcase of the selecting seat feature.'
    }
  }
});
