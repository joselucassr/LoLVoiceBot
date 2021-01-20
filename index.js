require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const apiKey = process.env.RIOT_API_KEY;

const getPlayer = async (summName) => {
  try {
    // Makes the summoner request
    const summ = await axios.get(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(
        summName,
        'UTF-8',
      )}?api_key=${apiKey}`,
    );

    // Gets the ID for the summoner
    const summID = summ.data.id;

    // Makes the spectator request
    const spectator = await axios.get(
      `https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summID}?api_key=${apiKey}`,
    );

    let summsList = '';

    if (spectator.status === 200) {
      for (let i = 0; i < spectator.data.participants.length; i++) {
        summsList =
          summsList + `${spectator.data.participants[i].summonerName}, \n`;
      }
      return summsList;
    } else {
      console.log('Aqui?');
      return 'notPlaying';
    }
  } catch (err) {
    console.error(err.message);
    return 'notPlaying';
  }
};

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

const prefix = 'l!';
// Create an event listener for messages
client.on('message', async (msg) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLocaleLowerCase();

  switch (command) {
    case 'search':
      if (!msg.content.match(/"([^"]+)"/)) {
        return await msg.channel.send(
          `Por favor digite o nome de invocador entre áspas`,
        );
      }

      let summName = msg.content.match(/"([^"]+)"/)[1].trim();

      if (!summName) {
        return await msg.channel.send(`Por favor não deixe em branco`);
      }

      const summ = await getPlayer(summName);

      if (summ === 'notPlaying') {
        return await msg.channel.send(`O invocador não está jogando`);
      }

      await msg.channel.send(`${summ}`);
      break;
  }
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login('ODAxMDIzMjM1NTU4NjA0ODIx.YAapBQ.X7V_6UO97NkWITEc10MDVO6NPpE');

// getPlayer('YoDaSL Raiz 2k17');
