require('dotenv').config();

// Module imports
const Discord = require('discord.js');

// Function imports
const { inQuot, inArgs } = require('./utils/getInput');
const { simpleEmbed, completeEmbed } = require('./utils/embed');
const { checkRole } = require('./utils/checker');
const {
  notifyNewGame,
  askUserForGame,
  endGameQuestions,
} = require('./utils/sendDM');
const {
  registerPlayer,
  updatePlayer,
  deletePlayer,
} = require('./commands/managePlayer');
const { joinGame, stopGame } = require('./commands/manageGame');

// Create an instance of a Discord client
const client = new Discord.Client();

// Database
const connectDB = require('./config/db');
connectDB();

// Bot is ready
client.on('ready', () => {
  console.log('I am ready!');
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // LoL App ID 401518684763586560 , States: "Em partida" "Na Seleção de Campeões"

  const oldState = oldPresence.activities.find(
    (e) => e.applicationID === '401518684763586560',
  );

  const newState = newPresence.activities.find(
    (e) => e.applicationID === '401518684763586560',
  );

  if (oldState && newState && oldState.state === newState.state) {
    return 0;
  }

  // if (newState && newState.state === 'Em partida') {
  if (newState && newState.state === 'Na Seleção de Campeões') {
    askUserForGame(client.users, newPresence.userID);
  }

  if (
    // oldState &&
    // oldState.state === 'Em partida' &&
    // (!newState || newState.state !== 'Em partida')
    oldState &&
    oldState.state === 'Na Seleção de Campeões' &&
    (!newState || newState.state !== 'Na Seleção de Campeões')
  ) {
    endGameQuestions(client.users, newPresence.userID);
  }
});

client.on('messageReactionAdd', async (msgReaction, user) => {
  if (user.bot) {
    return 0;
  }

  const guild = await client.guilds.fetch('801023966126145576');

  if (
    msgReaction.message.embeds &&
    msgReaction.message.embeds[0].footer.text === 'Convite de Voice'
  ) {
    const returnObj = await joinGame(user.id, guild);

    if (returnObj.status === 'success') {
      notifyNewGame(client.users, returnObj.channel);
      msgReaction.message.delete();
    }

    if (returnObj.status === 'notFound') {
      return await simpleEmbed(
        msgReaction.message,
        'Você ainda não foi registrado',
        `Basta enviar uma mensagem para um de nossos moderadores pelo lol e aguardar.`,
      );
    }

    if (returnObj.status === 'notPlaying') {
      return await simpleEmbed(
        msgReaction.message,
        'Você ainda não está em partida',
        `Tenha certeza de estar pelo menos na tela de carregamento da partida **(logo após as escolhas de campeões)**.`,
      );
    }

    if (returnObj.status === 'channelExists') {
      return await simpleEmbed(
        msgReaction.message,
        'O canal da sua partida já existe',
        `Basta acessar o canal **Jogo: ${returnObj.channel.channel_game_id}** no topo da lista de canais.`,
      );
    }
  }

  if (
    msgReaction.message.embeds &&
    msgReaction.message.embeds[0].footer.text === 'Fim da partida'
  ) {
    await stopGame(user.id, guild);
    msgReaction.message.delete();
    completeEmbed(
      msgReaction.message,
      '• GGWP e até a próxima invocador!',
      'Canal fechado, espero que tenha aproveitado bem o nosso Voice Bot :D',
      'https://static.wikia.nocookie.net/leagueoflegends/images/2/29/Honor_GG.png',
      'https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Fat_Poro.jpg',
      [],
      'Fim da partida',
      false,
    );
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // 801023966126145576
  const guild = await client.guilds.fetch('801023966126145576');

  if (oldState.channel && oldState.channel.members.size === 0)
    stopGame(newState.id, guild);
});

const prefix = 'l!';
// Create an event listener for messages
client.on('message', async (msg) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  msg.delete();

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLocaleLowerCase();

  // 801023966126145576
  const guild = await client.guilds.fetch('801023966126145576');

  switch (command) {
    case 'register': {
      let roleCheck = await checkRole(msg);
      if (roleCheck === 'noPerm') return;

      let summName = await inQuot(msg);
      let args = await inArgs(msg);

      if (summName === 'stop') {
        return 0;
      }
      const returnObj = await registerPlayer(msg, summName, args);

      if (returnObj.status === 'alreadyRegistered') {
        return await simpleEmbed(
          msg,
          `Jogador(a) já está registrado(a)`,
          `<@${returnObj.discordID}> **/ ${summName}** já registrado(a). \nTalvez você queira usar 'l!update' para atualizar o nome de invocador.`,
        );
      }

      if (returnObj.status === 'playerRegistered') {
        return await simpleEmbed(
          msg,
          `Jogador(a) registrado(a) com sucesso`,
          `<@${returnObj.discordID}> **/ ${summName}** registrado(a). \nFuncionalidades completas do bot desbloqueadas.`,
        );
      }

      if (returnObj.status === 'error') {
        return await simpleEmbed(msg, `Erro`, `Um erro inexperado aconteceu.`);
      }

      break;
    }

    case 'update': {
      let roleCheck = await checkRole(msg);
      if (roleCheck === 'noPerm') return;

      let summName = await inQuot(msg);
      let args = await inArgs(msg);

      if (summName === 'stop') {
        return 0;
      }
      const returnObj = await updatePlayer(msg, summName, args);

      if (returnObj.status === 'notRegistered') {
        return await simpleEmbed(
          msg,
          `Jogador(a) não está registrado(a)`,
          `<@${returnObj.discordID}> **/ ${summName}** não pode ser encontrado(a). \nTalvez você queira usar 'l!register' para registrar o(a) jogador(a).`,
        );
      }

      if (returnObj.status === 'playerUpdated') {
        return await simpleEmbed(
          msg,
          `Jogador(a) atualizado(a) com sucesso`,
          `<@${returnObj.discordID}> **/ ${summName}** atualizado(a) \nCaso queira atualizar novamente basta usar o 'l!update'.`,
        );
      }

      break;
    }

    case 'delete': {
      let roleCheck = await checkRole(msg);
      if (roleCheck === 'noPerm') return;

      let args = await inArgs(msg);

      const returnObj = await deletePlayer(msg, args);

      if (returnObj.status === 'notRegistered') {
        return await simpleEmbed(
          msg,
          `Jogador(a) não está registrado`,
          `<@${returnObj.discordID}> não pode ser encontrado(a). \nTalvez você queira usar 'l!register' para registrar o(a) jogador(a).`,
        );
      }

      if (returnObj.status === 'playerDeleted') {
        return await simpleEmbed(
          msg,
          `Jogador(a) deletado(a) com sucesso`,
          `<@${returnObj.player.player_discord_id}> **/ ${returnObj.player.player_summ_name}** removido(a). \nCaso queira registrar novamente basta usar 'l!register'.`,
        );
      }

      break;
    }

    case 'join':
      const returnObj = await joinGame(msg.author.id, guild);

      if (returnObj.status === 'success') {
        notifyNewGame(client.users, returnObj.channel);
      }

      if (returnObj.status === 'notFound') {
        return await simpleEmbed(
          msg,
          'Você ainda não foi registrado(a)',
          `Basta enviar uma mensagem para um de nossos moderadores pelo lol e aguardar.`,
        );
      }

      if (returnObj.status === 'notPlaying') {
        return await simpleEmbed(
          msg,
          'Você ainda não está em partida',
          `Tenha certeza de estar pelo menos na tela de carregamento da partida **(logo após as escolhas de campeões)**.`,
        );
      }

      if (returnObj.status === 'channelExists') {
        return await simpleEmbed(
          msg,
          'O canal da sua partida já existe',
          `Basta acessar o canal **Jogo: ${returnObj.channel.channel_game_id}** no topo da lista de canais.`,
        );
      }
      break;

    case 'stop':
      stopGame(msg.author.id, guild);
      break;
  }
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.DISCORD_API_KEY);
