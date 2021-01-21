// Function imports
const { getPlayerbyDisId, getSummoner, getMatch } = require('./managePlayer');
const { createChannel } = require('./manageChannel');

// Model imports
const Channel = require('../models/Channel');

const joinGame = async (author, msg) => {
  const player = await getPlayerbyDisId(author.id);

  if (player.status === 'error' || player.status === 'notFound') {
    return { status: player.status };
  }

  const match = await getMatch(player.player_riot_id);
  // const match = await getMatch(
  //   'Gnevdo3bhFr0w48H91BccsB2fl3-NH48jMDboIXOBywHQVY',
  // );

  if (match === 'notPlaying') {
    return { status: 'notPlaying' };
  }
  const activePlayer = match.data.participants.find(
    (e) => e.summonerId === player.player_riot_id,
    // (e) => e.summonerId === 'Gnevdo3bhFr0w48H91BccsB2fl3-NH48jMDboIXOBywHQVY',
  );

  const channel = await Channel.findOne({
    $and: [
      { channel_game_id: match.data.gameId },
      { channel_team_id: activePlayer.teamId },
    ],
  });

  if (channel) {
    return { status: 'channelExists', channel };
  }

  let playerTeam = match.data.participants.filter(
    (e) => e.teamId === activePlayer.teamId,
  );

  let channelFields = {
    channel_game_id: match.data.gameId,
    channel_team_id: activePlayer.teamId,
    channel_participants: playerTeam,
  };

  const channelCheck = await createChannel(msg, playerTeam, match.data.gameId);

  if (channelCheck === 'success') {
    const newChannel = await Channel(channelFields);
    await newChannel.save();

    return { status: 'success', channel: newChannel };
  }
};

module.exports = {
  joinGame,
};
