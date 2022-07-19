module.exports = {
  name: "interactionCreate",
  description: "Manages all the slash commands initiation",
  once: false,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.slashCommands.get(
      interaction.commandName
    );

    if (!command) return;
    if (!interaction.guild)
      return interaction.reply("Commands only work in a server");
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (!(interaction.replied || interaction.deferred))
        await interaction.reply({
          content:
            "There was an error while executing this command! " + error.message,
          ephemeral: true,
        });
      else
        await interaction.editReply({
          content:
            "There was an error while executing this command! " + error.message,
          ephemeral: true,
        });
    }
  },
};
