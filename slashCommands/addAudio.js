const { SlashCommandBuilder } = require("@discordjs/builders");
const { errEm, getSounds } = require("../helpers/utils.js");
const Voice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const fs = require("fs");
const fetch = require("node-fetch");
const fileType = require("file-type");
const Readable = require("stream").Readable;

module.exports = {
  formatName: "Ping",
  data: new SlashCommandBuilder()
    .setName("addaudio")
    .setDescription("Add a new audio file to the bot")
    .addSubcommand((subCommand) =>
      subCommand
        .setName("attachment")
        .setDescription("Send an attachment")
        .addStringOption((option) =>
          option
            .setName("audio-name")
            .setDescription("The audio name for the file to be saved as")
            .setRequired(true)
        )

        .addAttachmentOption((option) =>
          option
            .setName("audio")
            .setDescription("The audio you want to upload")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("youtube")
        .setDescription("Send a youtube link")
        .addStringOption((option) =>
          option
            .setName("audio-name")
            .setDescription("The audio name for the file to be saved as")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("link")
            .setDescription("The youtube video link(Max limit 1 minute)")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    let audioName = interaction.options.getString("audio-name");
    audioName = audioName.match(/[\p{L}\p{N}\s]/gu).join('');
    let audios = getSounds().map((s) => {
      return s.split(".")[0];
    });
    let command = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });
    if (audios.includes(audioName))
      return interaction.editReply(
        "There is already an audio saved with this name"
      );
    if (audioName.length > 100)
      return interaction.editReply(
        "audio name cannot be longer than 100 letters"
      );

    if (command === "attachment") {
      let attachment = interaction.options.getAttachment("audio");
      if (!["audio/mpeg", "audio/x-wav"].includes(attachment.contentType))
        return interaction.editReply(
          "Only MP3 or WAV audio files are supported"
        );
      let file = await checkPlayable(attachment.url, audioName, interaction);
    } else if (command === "youtube") {
      let url = interaction.options.getString("link");
      if (!matchYoutubeUrl(url))
        return interaction.editReply("Not a valid youtube video URL");
      try {
        let info = await ytdl.getBasicInfo(url);
        if (info.videoDetails.lengthSeconds > 43200)
          return interaction.editReply("Video is longer than 12 hours");
        let writeableStream = fs.createWriteStream(`./sounds/${audioName}.mp3`);
        let readableStream = ytdl(url, { filter: "audioonly" });
        let stream = readableStream.pipe(writeableStream);
        let success = false;
        stream.on("finish", function () {
          interaction.editReply("Successfully saved the audio");
          success = true;
        });
        setTimeout(() => {
          if (success === false)
            interaction.editReply(
              "Timed out. Could not download in 60 seconds"
            );
          readableStream.destroy();
          writeableStream.destroy();
        }, 60 * 1000);
      } catch (e) {
        await interaction.editReply(
          "Uh-oh error in downloading that video" + e.message
        );
      }
    }
  },
};

function matchYoutubeUrl(url) {
  let p =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  if (url.match(p)) {
    return url.match(p)[1];
  }
  return false;
}

async function checkPlayable(url, audioName, interaction) {
  let fileInfo = await fetch(url, { method: "HEAD" }),
    size = fileInfo.headers.get("content-length"),
    type = fileInfo.headers.get("content-type");
  if (size > 100 * 1e6)
    return interaction.editReply({
      content: "File size too big. Limit 100 MBs",
      ephemeral: true,
    });

  if (!["audio/mpeg", "audio/x-wav"].includes(type))
    return interaction.editReply({
      content: "Only WAV or MP3 files are allowed",
      ephemeral: true,
    });

  await interaction.editReply({
    content:
      "Downloading... This might take a bit depending on the size (If i get stuck here for more than 1 minute please reuse the command)",
    ephemeral: true,
  });
  let res = await fetch(url);
  let audioBuffer = await res.buffer();
  await interaction.editReply({
    content:
      "Downloaded! Processing the file (If i get stuck here for more than 1 minute please reuse the command)",
    ephemeral: true,
  });
  let audioType = await fileType.fromBuffer(audioBuffer);
  if (
    !["audio/mpeg", "audio/x-wav", "audio/vnd.wave"].includes(audioType?.mime)
  )
    return interaction.editReply({
      content: "Only WAV or MP3 files are allowed",
      ephemeral: true,
    });
  let readableStream = new Readable();
  readableStream.push(audioBuffer);
  readableStream.push(null);
  let audioResource = Voice.createAudioResource(readableStream);
  let player = Voice.createAudioPlayer();
  player.play(audioResource);
  player.once(Voice.AudioPlayerStatus.Playing, () => {
    if (!player.checkPlayable())
      return interaction.editReply("That file is not playable");
    interaction.editReply("The audio file was playable. Saving on drive");

    fs.writeFile(
      `./sounds/${audioName}.${
        audioType?.mime === "audio/mpeg" ? "mp3" : "wav"
      }`,
      audioBuffer,
      {},
      (err) => {
        if (err) interaction.editReply("Error in saving file.");
        else {
          interaction.editReply("Successfully saved the audio");
        }
      }
    );
  });
}
