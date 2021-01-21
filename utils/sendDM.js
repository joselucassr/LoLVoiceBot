// Module imports
const Discord = require('discord.js');

// Model imports
const Channel = require('../models/Channel');
const Player = require('../models/Player');

const notifyNewGame = async (users, channel) => {
  try {
    const {
      channel_participants,
      channel_game_id,
      channel_invite_link,
    } = channel;
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
        .setTitle(`• Canal criado! criado`)
        .setDescription(
          `➜ O canal do **Jogo: ${channel_game_id}** pode ser encontrado no topo da lista de canais do servidor.`,
        )
        .setThumbnail(
          'https://static.wikia.nocookie.net/leagueoflegends/images/c/c1/Nexus_Blitz_Sudden_Death_event.png',
        )
        .setImage(
          'https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Fat_Poro.jpg',
        )
        .spliceFields(0, 0, [
          {
            name: '- Como que faz?',
            value:
              '**__É só acessar o servidor e clicar no canal lá em cima.__ \nOu clicar em "*Entrar na chamada de voz*" na mensagem em cima dessa.**',
          },
        ])
        .setFooter('Enviado em:')
        .setTimestamp(Date.now())
        .setColor('#5bc0e3');

      member
        .send(channel_invite_link, embed)
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

const askUserForGame = async (users, player_discord_id) => {
  const member = await users.fetch(player_discord_id, true);

  const embed = new Discord.MessageEmbed()
    .setTitle(`• Percebi que entrou em uma partida.`)
    .setDescription(
      `<:missing:801812715685412915> Deseja criar uma sala de Voice Chat com seu time?`,
    )
    .setThumbnail(
      'https://static.wikia.nocookie.net/leagueoflegends/images/2/29/Honor_GG.png',
    )
    .setImage(
      'https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Fat_Poro.jpg',
    )
    .spliceFields(0, 0, [
      {
        name: '- Como que faz?',
        value: '__Basta clicar na reação ✅ abaixo.__',
      },
    ])
    .setFooter('Convite de Voice')
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  member
    .send(``, embed)
    .then((msg) => msg.react('✅'))
    .catch((err) => {
      console.log(err);
      return 0;
    });
};

const endGameQuestions = async (users, player_discord_id) => {
  const member = await users.fetch(player_discord_id, true);

  const channel = await Channel.findOne({
    $and: [
      { channel_creator_dis_id: player_discord_id },
      { channel_game_is_active: true },
    ],
  });

  if (!channel) {
    return 0;
  }

  const embed = new Discord.MessageEmbed()
    .setTitle(`Deseja encerrar o canal de voz?`)
    .setDescription(
      `Percebi que a partida acabou, deseja encerrar o canal de voz agora? \nBasta não reagir abaixo que manterei ela até todos saírem.`,
    )
    .setFooter('Fim da partida')
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  member
    .send(``, embed)
    .then((msg) => msg.react('✅'))
    .catch((err) => {
      console.log(err);
      return 0;
    });

  // const embed = new Discord.MessageEmbed()
  //   .setTitle(`De?`)
  //   .setDescription(`Como foram seus teammates na última partida?`)
  //   .setFooter('Feedback')
  //   .setTimestamp(Date.now())
  //   .setColor('#5bc0e3');

  // member
  //   .send(``, embed)
  //   // .then((msg) => msg.react('✅'))
  //   .then((msg) => {
  //     msg.react('801782663961772052');
  //     msg.react('801782663794393098');
  //     msg.react('801782626120892426');
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     return 0;
  //   });
};

module.exports = {
  notifyNewGame,
  askUserForGame,
  endGameQuestions,
};
