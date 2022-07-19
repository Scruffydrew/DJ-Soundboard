const { Client, Collection, Intents } = require("discord.js"),
  config = require("./config.json"),
  { exec } = require("child_process"),
  client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  }),
  utils = require("./helpers/utils.js");

exec("node ./deploy-commands.js", (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

let fs = require("fs");
client.slashCommands = new Collection();

const slashCommandFiles = fs
  .readdirSync("./slashCommands")
  .filter((file) => file.endsWith(".js"));
for (const file of slashCommandFiles) {
  let command = require(`./slashCommands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.slashCommands.set(command.data.name, command);
}

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  let event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    console.log(`Registered Event ${event.name}: ${event.description}`);
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const prefix = config.prefix;

client.on("messageCreate", async (message) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "eval") {
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), { code: "xl" });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
});

function clean(text) {
  if (typeof text === "string")
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  else return text;
}

client.voice.volume = config.voiceDefault.volume;

const express = require("express");
const app = express();
const port = config.PORT;
var path = require('path');

//app.use((req, res, next) => {
	
  // -----------------------------------------------------------------------
  // authentication middleware

//	const auth = {login: 'David Joseph', password: 'catfood'} // change this

  // parse login and password from headers
//	const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
//	const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
//	if (login && password && login === auth.login && password === auth.password) {
		// Access granted...
//		return next()
//	}

  // Access denied...
//	res.set('WWW-Authenticate', 'Basic realm="401"') // change this
//	res.status(401).send('Login required') // custom message
//	var ip = (req.socket.remoteAddress).split(':')[3];
//	const { lookup } = require('geoip-lite');
//	console.log("\x1b[96mUser Attempted to Connect but Failed	  ip: " + ip + " \x1b[0m");
//	console.log(lookup(ip)); // location of the ip
  // -----------------------------------------------------------------------
//})

app.get("", (req, res) => {
	var ip = (req.socket.remoteAddress).split(':')[3];
	console.log("\x1b[96mUser has Successfully Connected	  ip: " + ip + " \x1b[0m");
	res.sendFile(__dirname + "/index.html");
});

app.get("/api/soundFiles/findAll", (req, res) => {
  res.json(utils.getSounds());
});

app.get("/api/users/findAll", (req, res) => {
  res.json([{ id: ".", username: "." }]);
});

app.post("/bot/playFile", async (req, res) => {
  var ip = (req.socket.remoteAddress).split(':')[3];
  console.log("\x1b[93mThe ip: " + ip + " has played a sound \x1b[0m");
  utils.playSound(client, req.query);
  res.sendStatus(200);
});

app.post("/bot/random", async (req, res) => {
  var ip = (req.socket.remoteAddress).split(':')[3];
  console.log("\x1b[93mThe ip: " + ip + " has played a random sound \x1b[0m");
  let sounds = utils.getSounds();
  utils.playSound(client, {
    soundFileId: sounds[Math.floor(Math.random() * sounds.length)],
    id: req.query.id,
  });
  res.sendStatus(200);
});

app.get("/bot/volume", async (req, res) => {
  res.send((client.voice.volume * 100).toFixed(0));
});

app.post("/bot/volume", async (req, res) => {
  if (isNaN(req.query.volume) || req.query.volume > 200 || req.query.volume < 1) return res.sendStatus(400);
  client.voice.volume = parseInt(req.query.volume) / 100;
});

app.post("/bot/restart", async (req, res) => {
  var ip = (req.socket.remoteAddress).split(':')[3];
  console.log("\x1b[35mThe ip: " + ip + " has restarted the bot \x1b[0m");
  res.sendStatus(200);
  process.exit();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

client.login(config.token).then((r) => {});
