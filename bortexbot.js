console.log("Bondia");

// Requires das dependências
require("dotenv").config();
const twitchTMI = require("tmi.js");
const {Client} = require("discord.js");
const {MessageEmbed} = require("discord.js");
const YouTube = require("discord-youtube-api");
const ytdl = require("ytdl-core");
// console.log(process.env.twitchBot_user);



// Variáveis Globais
let discordVoiceChannel = null;
let discordTextChannel = null;

let canalTwitch = 'virusvortex';

let playlist = [];
let playlistTocadas = [];
let musicaAtual;
let botCantando = false;
let discordDispatcher;
let botPausado = false;



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

	if((command === 'blist') || (command === 'bl')) {
		if(botCantando){
			var stringolaDoCaos = "";
			stringolaDoCaos += 0 + ' - ' + ((musicaAtual.titulo.length > 30)?musicaAtual.titulo.slice(0,31)+'...':musicaAtual.titulo) + ' - ' + musicaAtual.autor + '\n';
			for (var m in playlist){
				if (m>3){ stringolaDoCaos += "...\n"; break; }
				stringolaDoCaos += m + ' - ' + ((playlist[m].titulo.length > 30)?playlist[m].titulo.slice(0,31)+'...':playlist[m].titulo) + ' - ' + playlist[m].autor + '\n';
			}

			clientTwitch.action(channel, `${stringolaDoCaos}`); // Imprime a lista de músicas 
		} else {
			clientTwitch.action(channel, `A playlist está vazia`);
		}
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

discordClient.on('message', (message) => {
	if (message.author.bot) return;

	const args = message.content.slice(1).split(' ');
	const command = args.shift().toLowerCase();

	if(botCantando){
		switch(command){
			case 'bpause':
			//case 'bp':
				if(botPausado){
					botPausado = false;
					discordDispatcher.resume();
				} else {
					botPausado = true;
					discordDispatcher.pause();
				}
				return;

			case 'bresume':
			//case 'br':
				if(botPausado){
					botPausado = false;
					discordDispatcher.resume();
				}
				return;
			
			case 'bnext':
			case 'bn':
				playlistTocadas.push(musicaAtual);
				if(playlist.length>0) ytPlay();
				else {
					botCantando = false;
					discordVoiceChannel.leave();
				}
				return;
			
			case 'bprev':
			case 'bpv':
				if(playlistTocadas.length>0){
					if(botCantando) playlist.unshift(musicaAtual);
					playlist.unshift(playlistTocadas.pop());
					ytPlay();
				}
				return;
			
			case 'bclear':
			case 'bc':
				playlist = [];
				playlistTocadas = [];
				botCantando = false;
				discordVoiceChannel.leave();
				return;
		}
	}

	if ((command === (`bplay`)) || (command === (`bp`))){
		if(args.length < 1){discordTextChannel.send("Preciso de uma música para procurar!"); return;}
		ytRequest(args.join(' '), message.author.username, false);

		return
	}

	if ((command === (`blist`)) || (command === (`bl`))){
		const playlistEmbed = new MessageEmbed()
			.setColor('#0085c9');
			// .addFields(
			// 	{ name: 'Regular field title', value: 'Some value here' },
			// 	{ name: '\u200B', value: '\u200B' },
			// 	{ name: 'Inline field title', value: 'Some value here', inline: true },
			// 	{ name: 'Inline field title', value: 'Some value here', inline: true },
			// )
			// .addField('Inline field title', 'Some value here', true);

		var lst = [];
		var contagem = playlistTocadas.length * (-1);
		// lista.forEach((a, b) => {
		// lst.push(\t• ${a.a} - ${a.b});
		// });
		
		


		if((playlistTocadas.length + playlist.length == 0) && (!musicaAtual)){
			discordTextChannel.send("Playlist vazia.");
			return;
		}


		let stringolaDoCaos = "";
		playlistTocadas.forEach(element => {
			// stringolaDoCaos += JSON.stringify(element) + "\n";

			lst.push(`\t ${contagem++} - ${element.titulo} - ${element.autor} [${element.duration}]`);
		});

		if(musicaAtual){
			// stringolaDoCaos += JSON.stringify(musicaAtual) + "\n";
			lst.push(`\t ${contagem++} - ${musicaAtual.titulo} - ${musicaAtual.autor} [${musicaAtual.duration}]`);
		}
		
		playlist.forEach(element => {
			// stringolaDoCaos += JSON.stringify(element) + "\n";

			lst.push(`\t ${contagem++} - ${element.titulo} - ${element.autor} [${element.duration}]`);
		});

		// playlistEmbed.fields.push({
		// 	name: 'Playlist da Live',
		// 	value: lst.join('\n'),
		// 	inline: false
		// });

		playlistEmbed.setDescription(lst.join('\n'));
		playlistEmbed.setFooter("\u3000".repeat(10)+"|");
		// discordTextChannel.send(`${stringolaDoCaos}`); // Manda mensagem no discord com a playlist
		discordTextChannel.send(playlistEmbed); // Manda mensagem no discord com a playlist
		return;
	}

});




//-----Parte Interna
const youtube = new YouTube(process.env.youtube_token);

function ytRequest(filtro, usuario, ehTwitch=true){
	youtube.searchVideos(filtro, 1).then( response => {
		playlist.push({
			url: response.url,
			titulo: response.title,
			autor: usuario,
			duration: response.length
		});

		discordTextChannel.send(`${usuario} pediu a música: "${response.title}"`); // Manda mensagem no Discord de qual música o usuário pediu
		if(ehTwitch) clientTwitch.action(canalTwitch, `@${usuario}, a música: "${response.title}" foi adicionada à playlist na posição ${playlist.length}.`); // Retorna no chat que a música foi pedida

		if(!botCantando) ytPlay();
	});
};

function ytPlay(){
	musicaAtual = playlist.shift();
	
	discordVoiceChannel.join().then( connection => {
		let stream = ytdl(musicaAtual.url, {filter:"audioonly"});
		discordDispatcher = connection.play(stream);

		discordDispatcher.on('speaking', value => {
			if(value == 1) botCantando = true;
			else {
				if(!botPausado){
					playlistTocadas.push(musicaAtual);
					if(playlist.length>0){
						ytPlay();
					} else {
						botCantando = false;
						discordVoiceChannel.leave();
					}
				}
			}

		});
	});
	discordTextChannel.send(`Agora tocando "${musicaAtual.titulo}" a pedido de ${musicaAtual.autor}`); // Manda mensagem no Discord de qual música está tocando
};