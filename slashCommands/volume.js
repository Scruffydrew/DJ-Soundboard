const { SlashCommandBuilder } = require("@discordjs/builders");
const { errEmb } = require("../helpers/utils.js");

module.exports = {
  formatName: "Set Volume",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Sets the current volume")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setMaxValue(200)
        .setMinValue(1)
        .setDescription("Change volume").setRequired(true)
    ),
  async execute(interaction) {
    interaction.client.voice.volume = interaction.options.getInteger("volume")/100;
    interaction.reply("Set volume to " + interaction.options.getInteger("volume"));
  },
};
