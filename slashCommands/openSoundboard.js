const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { errEmb, getSounds, playSound } = require("../helpers/utils.js");

module.exports = {
  formatName: "Open Soundboard",
  data: new SlashCommandBuilder()
    .setName("soundboard")
    .setDescription("Opens the soundboard!")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("open a particular page")
        .setMinValue(1)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let totalAudios = getSounds();
    let audiosPages = [],
      chunk = 20;
    for (let n = 0; n < totalAudios.length; n += chunk) {
      audiosPages.push(totalAudios.slice(n, n + chunk));
    }
    let page = interaction.options.getInteger("page");
    if (!page) page = 0;
    else page -= 1;
    if (page >= audiosPages.length)
      return interaction.editReply(
        "Page number more than the actual available sounds"
      );
    let commandButtons = new Discord.MessageActionRow().setComponents([
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setEmoji("⏪")
        .setCustomId("back10"),
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setEmoji("◀")
        .setCustomId("back"),
      new Discord.MessageButton()
        .setStyle("SECONDARY")
        .setDisabled(true)
        .setCustomId("pages")
        .setLabel(`${page + 1}/${audiosPages.length}`),
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setEmoji("▶")
        .setCustomId("next"),
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setEmoji("⏩")
        .setCustomId("next10"),
    ]);
    let buttonPage = createSoundboard(audiosPages[page], page);
    await interaction.editReply("Opened soundboard!");
    let message = await interaction.channel.send({
      components: [...buttonPage, commandButtons],
    });
    const collector = message.createMessageComponentCollector({
      idle: 1000 * 30,
    });
    collector.on("collect", async (i) => {
      let unchangedPage = page;
      if (i.customId === "back10") page -= 10;
      else if (i.customId === "back") page -= 1;
      else if (i.customId === "next") page += 1;
      else if (i.customId === "next10") page += 10;
      if (unchangedPage !== page) {
        if (page >= audiosPages.length) {
          await i.reply({
            content: "Page number more than the actual available sounds",
            ephemeral: true,
          });
          page = audiosPages.length - 1;
        }
        if (page < 0) {
          await i.reply({
            content: "Page number less than the 0",
            ephemeral: true,
          });
          page = 0;
        }
        buttonPage = createSoundboard(audiosPages[page], page);
        commandButtons.components[2].setLabel(
          `${page + 1}/${audiosPages.length}`
        );
        if (i.replied)
          message.edit({ components: [...buttonPage, commandButtons] });
        else i.update({ components: [...buttonPage, commandButtons] });
        return;
      } else {
        playSound(interaction.client, {
          soundFileId: totalAudios[parseInt(i.customId)],
          username: i.user.tag,
          id: i.user.id,
        });
        i.reply({ content: "Playing...", ephemeral: true });
      }
    });
    collector.on("end", () => {
      /*let disabledComp = message.components.map((ar) => {
        return new Discord.MessageActionRow().setComponents(
          ar.components.map((b) => {
            return b.setDisabled(true);
          })
        );
      });
      message.edit({ components: disabledComp });*/
      message.delete()
    });
  },
};

function createSoundboard(arr,page) {
  let actionRowArray = [],
    chunk = 5;
  for (let n = 0; n < arr.length; n += chunk) {
    let data = arr.slice(n, n + chunk).map((s, i = 0) => {
      let button = new Discord.MessageButton()
        .setCustomId(page*20 + n + i + "")
        .setLabel(s.split(".")[0].substring(0, 25))
        .setStyle("PRIMARY");
      i++;
      return button;
    });
    actionRowArray.push(new Discord.MessageActionRow().addComponents(data));
  }
  return actionRowArray;
}
