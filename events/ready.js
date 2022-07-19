const utils = require("../helpers/utils.js");
const config = require("../config.json");

module.exports = {
  name: "ready",
  once: true,
  description: "Shows the first time ready events",
  async execute(client) {
    console.log("Name: " + client.user.tag);
	console.log(client.user.tag + " is ready now");
    console.log("Loaded " + utils.getTotalSounds() + " sounds");
    function setPresence() {
      client.user.setPresence({
        activities: [
          {
            name: `Managing ${utils.getTotalSounds()} sounds`,
          },
        ],
        status: "online",
      });
    }
    let channel = client.channels.cache.get(config.voiceDefault.channel);
    if (!channel || !channel.guild) {
      console.log("Bot not properly configured, exiting.");
      process.exit();
    }
    utils.connectVC(client, channel);

    setInterval(() => {
      setPresence();
    }, 1000 * 60 * 60 * 15);
    setPresence();
  },
};
