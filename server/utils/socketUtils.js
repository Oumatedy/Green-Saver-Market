/**
 * Emits an event to all sockets of a particular user.
 * @param {SocketServer} io 
 * @param {Map<string, Set<string>>} userSockets 
 * @param {string} userId 
 * @param {string} event 
 * @param {any} data 
 */
function emitToUser(io, userSockets, userId, event, data) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    sockets.forEach(socketId => io.to(socketId).emit(event, data));
  }
}

module.exports = {
  emitToUser,
};
