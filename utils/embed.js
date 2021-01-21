const Discord = require('discord.js');

const simpleEmbed = async (msg, title, description, isTemporary = true) => {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setFooter('Enviado em:')
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  return msg.channel
    .send(``, embed)
    .then((m) => {
      if (isTemporary) m && m.delete({ timeout: 15000 });
    })
    .catch(() => {
      return 0;
    });
};

const completeEmbed = async (
  msg,
  title,
  description,
  thumbnail,
  image,
  fields,
  footer,
  isTemporary = true,
) => {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setImage(image)
    .spliceFields(0, 0, fields)
    .setFooter(footer)
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  return msg.channel
    .send(``, embed)
    .then((m) => {
      if (isTemporary) m && m.delete({ timeout: 15000 });
    })
    .catch(() => {
      return 0;
    });
};

const updateEmbed = async (msg, title, description, removeReactions) => {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setFooter('Enviado em:')
    .setTimestamp(Date.now())
    .setColor('#5bc0e3');

  await msg.edit(embed);
  if (removeReactions) {
    await msg.reactions.removeAll();
  }
};

module.exports = {
  simpleEmbed,
  completeEmbed,
  updateEmbed,
};
