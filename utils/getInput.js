const inQuot = async (msg) => {
  if (!msg.content.match(/"([^"]+)"/)) {
    await msg.channel.send(`Por favor digite entre áspas`);
    return 'stop';
  }

  let receivedMsg = msg.content.match(/"([^"]+)"/)[1].trim();

  if (!receivedMsg) {
    await msg.channel.send(`Por favor não deixe em branco`);
    return 'stop';
  }

  return receivedMsg;
};

const inArgs = async (msg) => {
  return msg.content.split(/ +/);
};

module.exports = {
  inQuot,
  inArgs,
};
