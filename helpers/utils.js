const Discord = require("discord.js");
const config = require("../config.json");
const fs = require("fs");
const Voice = require("@discordjs/voice");

module.exports.errEmb = (msg) => {
  const embed = new Discord.MessageEmbed()
    //.setColor("#FFFF00")
	.setColor("#FD0061")
    .setTitle(msg || ".");
  return embed;
};
module.exports.emb = (msg) => {
  const embed = new Discord.MessageEmbed()
    .setColor("#FFFF00")
    .setDescription(msg || ".");
  return embed;
};
module.exports.fromMillis = (ms) => {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000)),
    daysms = ms % (24 * 60 * 60 * 1000),
    hours = Math.floor(daysms / (60 * 60 * 1000)),
    hoursms = ms % (60 * 60 * 1000),
    minutes = Math.floor(hoursms / (60 * 1000)),
    minutesms = ms % (60 * 1000),
    sec = Math.floor(minutesms / 1000);
  return (
    "**" +
    days +
    "** Days **" +
    hours +
    "** Hours **" +
    minutes +
    "** Minutes **" +
    sec +
    "** Seconds"
  );
};

module.exports.getTotalSounds = () => {
  return this.getSounds().length;
};

module.exports.getSounds = () => {
  return fs
    .readdirSync("./sounds")
    .filter((file) => file.endsWith(".mp3") || file.endsWith(".wav"));
};
const { join } = require("node:path");

module.exports.playSound = (
  client,
  options = { soundFileId: "", user: {} }
) => {
  if (
    client?.voice?.connection?.state.status !==
    Voice.VoiceConnectionStatus.Ready
  )
    return this.connectVC(
      client,
      client.channels.cache.get(config.voiceDefault.channel)
    );
  const player = Voice.createAudioPlayer();
  const resource = Voice.createAudioResource(
    join(__dirname, "..", "sounds", options.soundFileId),
    { inlineVolume: true }
  );
  resource.volume.setVolume(client.voice.volume);
  player.play(resource);
  client.voice.connection.subscribe(player);
  let date = new Date(Date.now())
  console.log(
    `Playing ${options.soundFileId} by ${options.username} (${options.id}) At ${date.toString()}`
  );
};

module.exports.connectVC = (client, channel) => {
  client.voice.connection = Voice.joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
};
