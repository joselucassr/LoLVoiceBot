const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channel_id: {
    type: String,
  },
  channel_creator_dis_id: {
    type: String,
  },
  channel_game_id: {
    type: String,
  },
  channel_invite_link: {
    type: String,
  },
  channel_game_is_active: {
    type: Boolean,
    default: true,
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
