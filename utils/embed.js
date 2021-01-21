const Discord = require('discord.js');

const simpleEmbed = async (msg, title, description) => {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setFooter('Enviado em:')
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  return msg.channel
    .send(``, embed)
    .then((m) => m && m.delete({ timeout: 15000 }))
    .catch(() => {
      return 0;
    });
};

module.exports = {
  simpleEmbed,
};
