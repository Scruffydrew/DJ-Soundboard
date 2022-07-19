const { SlashCommandBuilder } = require("@discordjs/builders");
const { connectVC } = require("../helpers/utils.js");
const { ChannelType } = require("discord-api-types/v10");
module.exports = {
  formatName: "Change Channel",
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move the bot to another channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for the bot to move to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
    )
    .addBooleanOption((option) =>
      option
        .setName("move")
        .setDescription("Moves all the members from this VC to the new one")
    ),
  async execute(interaction) {
    let channel = interaction.options.getChannel("channel");
    await interaction.reply({ content: "Moving to <#" + channel.id + ">" });
    if (interaction.options.getBoolean("move")) {
      if (interaction.guild?.me?.voice?.channel) {
        interaction.guild.me.voice.channel.members.forEach((m) => {
          m.voice.setChannel(channel);
        });
      }
    }
    connectVC(interaction.client, channel);
  },
};
