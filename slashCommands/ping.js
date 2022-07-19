const { SlashCommandBuilder } = require("@discordjs/builders");
const { errEmb } = require("../helpers/utils.js");

module.exports = {
  formatName:"Ping",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    let embed = errEmb("Ping?");

    let m = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
      ephemeral: true,
    });
    embed
      .setTitle("Pong!")
      .setDescription(
        "Latency is " +
          (m.createdTimestamp - interaction.createdTimestamp) +
          "ms. API latency is " +
          Math.round(interaction.client.ws.ping) +
          "ms."
      )
      .setFooter({ text: "\nCommand Used by " + interaction.user.tag });
    await interaction
      .editReply({ embeds: [embed], ephemeral: true })
      .catch((e) => console.log(e));
  },
};
