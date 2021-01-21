const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  player_discord_id: {
    type: String,
  },
  player_riot_id: {
    type: String,
  },
  player_summ_name: {
    type: String,
  },
  player_created_at: {
    type: Date,
    default: Date.now,
  },
  player_updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = player = mongoose.model('player', playerSchema);
