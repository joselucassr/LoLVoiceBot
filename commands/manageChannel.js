const Player = require('../models/Player');

const createChannel = async (msg, participants, gameId) => {
  let playersDisIds = [];
  let unavailablePlayers = [];

  for (let i = 0; i < participants.length; i++) {
    let player = await Player.findOne({
      player_riot_id: participants[i].summonerId,
    });

    if (player) {
      playersDisIds.push(player.player_discord_id);
    } else {
      unavailablePlayers.push(participants[i].summonerName);
    }
  }

  let permissionOverwrites = [
    {
      type: 'role',
      id: msg.guild.roles.everyone.id,
      deny: ['VIEW_CHANNEL', 'CONNECT'],
    },
  ];

  for (let i = 0; i < playersDisIds.length; i++) {
    let permFields = {
      type: 'member',
      id: playersDisIds[i],
      allow: ['VIEW_CHANNEL', 'CONNECT'],
    };
    permissionOverwrites.push(permFields);
  }

  await msg.guild.channels.create(`Jogo: ${gameId}`, {
    type: 'voice',
    userLimit: 5,
    permissionOverwrites,
  });

  return 'success';
};

module.exports = {
  createChannel,
};
