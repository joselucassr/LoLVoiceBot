const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channel_game_id: {
    type: String,
  },
  channel_team_id: {
    type: String,
  },
  channel_participants: [],
  channel_created_at: {
    type: Date,
    default: Date.now,
  },
  channel_updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = channel = mongoose.model('channel', channelSchema);
