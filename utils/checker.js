// Functions import
const { simpleEmbed } = require('../utils/embed');

const checkRole = async (msg) => {
  if (
    msg.channel.type === 'dm' ||
    !msg.member.roles.cache.find((r) => r.id === '801865208066080820')
  ) {
    simpleEmbed(
      msg,
      'Sem permissão:',
      'Você não tem permissão para executar este comando.',
    );

    return 'noPerm';
  }
};

module.exports = {
  checkRole,
};
