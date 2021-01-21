// Function imports
const { getPlayerbyDisId, getSummoner, getMatch } = require('./managePlayer');
const { createChannel, deleteChannel } = require('./manageChannel');

// Model imports
const Channel = require('../models/Channel');
const Player = require('../models/Player');

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
      { channel_game_is_active: true },
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
    channel_creator_dis_id: author.id,
    channel_game_id: match.data.gameId,
    channel_team_id: activePlayer.teamId,
    channel_participants: playerTeam,
  };

  const channelCheck = await createChannel(msg, playerTeam, match.data.gameId);

  if (channelCheck.status === 'success') {
    channelFields.channel_id = channelCheck.channel.id;
    const newChannel = await Channel(channelFields);
    await newChannel.save();

    return { status: 'success', channel: newChannel };
  }
};

const stopGame = async (msg, guild) => {
  try {
    let player = await Player.findOne({
      player_discord_id: msg.author.id,
    });

    if (!player) {
      return { status: 'playerNotFound' };
    }

    const channel = await Channel.findOne({
      $and: [
        { channel_creator_dis_id: msg.author.id },
        { channel_game_is_active: true },
      ],
    });

    if (!channel) {
      return { status: 'channelNotFound' };
    }

    channel.channel_game_is_active = false;
    await channel.save();

    deleteChannel(guild, channel.channel_id);
  } catch (err) {
    console.log(err.message);
    return { status: 'error' };
  }
};

module.exports = {
  joinGame,
  stopGame,
};
