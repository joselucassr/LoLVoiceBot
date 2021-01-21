const apiKey = process.env.RIOT_API_KEY;
const axios = require('axios');

const Player = require('../models/Player');

const getSummoner = async (summName) => {
  try {
    // Makes the summoner request
    const summ = await axios.get(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(
        summName,
        'UTF-8',
      )}?api_key=${apiKey}`,
    );

    return summ.data;
  } catch (err) {
    console.error(err.message);
    return 'notPlaying';
  }
};

const getMatch = async (playerRiotID) => {
  try {
    // Gets the ID for the summoner
    const summID = playerRiotID;

    // Makes the spectator request
    const spectator = await axios.get(
      `https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summID}?api_key=${apiKey}`,
    );

    let summsList = '';

    if (spectator.status === 200) {
      return spectator;
    } else {
      return 'notPlaying';
    }
  } catch (err) {
    console.error(err.message);
    return 'notPlaying';
  }
};

const getPlayerbyDisId = async (playerDisId) => {
  try {
    const player = await Player.findOne({ player_discord_id: playerDisId });

    if (!player) {
      return { status: 'notFound' };
    }

    return player;
  } catch (err) {
    console.log(err.message);
    return 'error';
  }
};

const registerPlayer = async (msg, summonerName, args) => {
  try {
    let discordID = '';

    // Get by mention or ID
    if (msg.mentions.users.first()) {
      discordID = msg.mentions.users.first().id;
    } else {
      discordID = args[1];
    }

    let summoner = await getSummoner(summonerName);

    let player = await Player.findOne({ player_riot_id: summoner.id });

    console.log(player);

    if (player) {
      return { status: 'alreadyRegistered', discordID };
    }

    let playerFields = {
      player_discord_id: discordID,
      player_riot_id: summoner.id,
      player_summ_name: summonerName,
    };

    const newPlayer = new Player(playerFields);

    await newPlayer.save();

    await msg.member.roles.add('801845168289349632');
    await msg.member.roles.remove('801845304281923655');

    return { status: 'playerRegistered', discordID };
  } catch (err) {
    console.log(err.message);
    return { status: 'error' };
  }
};

const updatePlayer = async (msg, summonerName, args) => {
  try {
    let discordID = '';

    // Get by mention or ID
    if (msg.mentions.users.first()) {
      discordID = msg.mentions.users.first().id;
    } else {
      discordID = args[1];
    }

    let summoner = await getSummoner(summonerName);

    let player = await Player.findOne({ player_discord_id: discordID });

    if (!player) {
      return { status: 'notRegistered', discordID };
    }

    player.player_riot_id = summoner.id;
    player.player_summ_name = summonerName;

    await player.save();

    return { status: 'playerUpdated', discordID };
  } catch (err) {
    console.log(err.message);
    return 'error';
  }
};

const deletePlayer = async (msg, args) => {
  try {
    let discordID = '';

    // Get by mention or ID
    if (msg.mentions.users.first()) {
      discordID = msg.mentions.users.first().id;
    } else {
      discordID = args[1];
    }

    let player = await Player.findOne({ player_discord_id: discordID });

    if (!player) {
      return { status: 'notRegistered', discordID };
    }

    await player.delete();

    await msg.member.roles.remove('801845168289349632');
    await msg.member.roles.add('801845304281923655');

    return { status: 'playerDeleted', player };
  } catch (err) {
    console.log(err.message);
    return 'error';
  }
};

module.exports = {
  getSummoner,
  getMatch,
  getPlayerbyDisId,
  registerPlayer,
  updatePlayer,
  deletePlayer,
};
