const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function seatIdByIndex(idx) {
  const perRow = 10;
  const rowIndex = Math.floor(idx / perRow);
  const col = (idx % perRow) + 1;
  const rowLetter = String.fromCharCode('A'.charCodeAt(0) + rowIndex);
  return { seatId: `${rowLetter}${col}`, row: rowLetter, col };
}

exports.main = async (event) => {
  const { roomId, seatCount } = event;

  if (!roomId || typeof seatCount !== 'number' || seatCount <= 0) {
    return { ok: false, message: 'roomId and seatCount(number) required' };
  }

  // delete old seats for this room
  await db.collection('roomSeats').where({ roomId }).remove();

  // create seats
  const seats = [];
  for (let i = 0; i < seatCount; i++) {
    const { seatId, row, col } = seatIdByIndex(i);
    seats.push({
      roomId,
      seatId,
      label: seatId,
      enabled: true,
      row,
      col
    });
  }

  // insert
  const tasks = seats.map(doc => db.collection('roomSeats').add({ data: doc }));
  await Promise.all(tasks);

  return { ok: true, inserted: seatCount };
};