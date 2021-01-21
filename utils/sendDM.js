// Module imports
const Discord = require('discord.js');

// Model imports
const Player = require('../models/Player');

const notifyNewGame = async (users, channel) => {
  try {
    const { channel_participants, channel_game_id } = channel;
    let playersDisIds = [];

    for (let i = 0; i < channel_participants.length; i++) {
      let player = await Player.findOne({
        player_riot_id: channel_participants[i].summonerId,
      });

      if (player) {
        playersDisIds.push(player.player_discord_id);
      }
    }

    for (let i = 0; i < playersDisIds.length; i++) {
      const member = await users.fetch(playersDisIds[i], true);

      const embed = new Discord.MessageEmbed()
        .setTitle(`Canal do "Jogo: ${channel_game_id}" criado`)
        .setDescription(
          `O canal pode ser encontrado no topo da lista de nosso servidor.`,
        )
        .setFooter('Enviado em:')
        .setTimestamp(Date.now())
        .setColor('#5bc0e3');

      member
        .send(``, embed)
        .then()
        .catch((err) => {
          console.log(err);
          return 0;
        });
    }
  } catch (err) {
    console.log(err.message);
    return 'error';
  }
};

module.exports = {
  notifyNewGame,
};
