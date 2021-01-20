console.log("Bondia");

// Requires das dependências
require("dotenv").config();
const twitchTMI = require("tmi.js");
const {Client} = require("discord.js");
const YouTube = require("discord-youtube-api");
const ytdl = require("ytdl-core");
// console.log(process.env.twitchBot_user);



// Variáveis Globais
let discordVoiceChannel = null;
let discordTextChannel = null;

let canalTwitch = 'virusvortex';

let playlist = [];
let musicaAtual;
let botCantando = false;





//-----Parte da Twitch

// Cliente TMI credenciais
const clientTwitch = new twitchTMI.Client({
	connection: { reconnect: true },
	channels: [ 'virusvortex' ],
	identity: {
		username: process.env.twitchBot_user,
		password: process.env.twitchBot_token
	},
});

clientTwitch.connect(); // Bot conecta ao Twitch, usando credenciais acima


// Ao conectar, método adjacente
clientTwitch.on('connected', (address, port) => {
	// "Alca: Hello, World!"
	console.log("Bondia, Twitch");
});

// Ao receber mensagens no chat, método adjacente
clientTwitch.on('message', (channel, tags, message, self) => {
	// ConsoleLog de debug, printa toda mensagem recebida
	// console.log(`${tags['display-name']}: ${message}`);

	if(self || !message.startsWith('!')) return; // Retorna caso a mensagem recebida não for um comando

	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase();

	if(command === 'echo') {
		// Mandar mensagem no chat do canal definido no argumento "channel" (canal de origem do comando)
		// clientTwitch.say(channel, `@${tags['display-name']}, you said: "${args.join(' ')}"`);
		clientTwitch.action(channel, `@${tags['display-name']}, you said: "${args.join(' ')}"`); // O mesmo, porém usando comando 'me'
		discordTextChannel.send(`@${tags['display-name']}, you said: "${args.join(' ')}"`); // Manda mensagem no discord
	}

	if(command === 'bp') {
		ytRequest(args.join(' '), tags['display-name']);
		// discordVoiceChannel.join().then( connection => {
		// 	console.log("Conectado no VoiceChannel");
		// });
	}
});



//-----Parte do Discord

const discordClient = new Client();
discordClient.login(process.env.discordBot_token);

discordClient.on('ready', () => {
	console.log("Bondia, Discord");
	// console.log(discordClient.channels);
	//'770427947600838696' // ID do Live-Generals
	//'525140121347948565' // ID do #música-e-comandos
	discordClient.channels.fetch('770427947600838696').then( response => {
		discordVoiceChannel = response;										// Setar o VoiceChannel como Live-Generals
	});
	discordClient.channels.fetch('525140121347948565').then( response => {
		discordTextChannel = response;										// Setar o TextChannel como #música-e-comandos
	});
	// setTimeout(function(){discordTextChannel.send("Bondia, Discord");}, 2000); // Comando básico de mandar mensagem de texto
});




//-----Parte Interna
const youtube = new YouTube(process.env.youtube_token);

function ytRequest(filtro, usuario){
	youtube.searchVideos(filtro, 1).then( response => {
		playlist.push({
			url: response.url,
			titulo: response.title,
			autor: usuario
		});

		discordTextChannel.send(`${usuario} pediu a música: "${response.title}"`); // Manda mensagem no Discord de qual música o usuário pediu
		clientTwitch.action(canalTwitch, `@${usuario}, a música: "${response.title}" foi adicionada à playlist na posição ${playlist.length}.`); // O mesmo, porém usando comando 'me'

		if(!botCantando) ytPlay();
	});
};

function ytPlay(){
	musicaAtual = playlist.shift();
	discordVoiceChannel.join().then( connection => {
		let stream = ytdl(musicaAtual.url, {filter:"audioonly"});
		let dispatcher = connection.play(stream);

		dispatcher.on('speaking', value => {
			if(value == 1) botCantando = true;
			else if(playlist.length>0) ytPlay();
			else {
				botCantando = false;
				discordVoiceChannel.leave();
			}

		});
	});
	discordTextChannel.send(`Agora tocando "${musicaAtual.titulo}" a pedido de ${musicaAtual.autor}`); // Manda mensagem no Discord de qual música está tocando
};