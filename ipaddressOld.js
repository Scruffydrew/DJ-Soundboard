const { SlashCommandBuilder } = require("@discordjs/builders");
const { errEmb } = require("../helpers/utils.js");

var http = require('http');

http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
  resp.on('data', function(ip) {
	  globalThis.ip = ip	
  });
});

module.exports = {
  formatName:"ip",
  data: new SlashCommandBuilder()
    .setName("ip")
    .setDescription("Replies with website ip"),
  async execute(interaction) {
    let embed = errEmb("Fetching Current ip");
    let m = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
      ephemeral: true,
    });
    embed
      .setTitle("The Current ip is:")
      .setDescription(
		"http://" +
		ip +
		":2341"
      )
      .setFooter({ text: "\nCommand Used by " + interaction.user.tag });
    await interaction
      .editReply({ embeds: [embed], ephemeral: true })
      .catch((e) => console.log(e));
  },
};

