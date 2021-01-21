require('dotenv').config();

// Module imports
const Discord = require('discord.js');

// Function imports
const { inQuot, inArgs } = require('./utils/getInput');
const { simpleEmbed } = require('./utils/embed');
const { notifyNewGame } = require('./utils/sendDM');
const { registerPlayer } = require('./commands/managePlayer');
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

const prefix = 'l!';
// Create an event listener for messages
client.on('message', async (msg) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  msg.delete();

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLocaleLowerCase();

  switch (command) {
    case 'register':
      let summName = await inQuot(msg);
      let args = await inArgs(msg);

      if (summName === 'stop') {
        return 0;
      }
      await registerPlayer(msg, summName, args);

      break;

    case 'join':
      const returnObj = await joinGame(msg.author, msg);

      if (returnObj.status === 'success') {
        notifyNewGame(client.users, returnObj.channel);
      }

      if (returnObj.status === 'notFound') {
        return await simpleEmbed(
          msg,
          'Você ainda não foi registrado',
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
      // 801023966126145576

      const guild = await client.guilds.fetch('801023966126145576');
      stopGame(msg, guild);
      break;
  }
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.DISCORD_API_KEY);
