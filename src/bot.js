require('dotenv').config();
const tmi = require('tmi.js');
const { Client } = require('discord.js');
const YouTube = require("discord-youtube-api");
const ytdl = require('ytdl-core');

const twitchChannelName = 'deusmagnum';
const client = new Client();
const youtube = new YouTube(process.env.YOUTUBE_TOKEN);

let discordConnected = false;
let twitchConnected = false;
let discordBotChannel = null;
let discordVoiceChannel = null;
let voiceJoined = false;

const pedirMusica = function(message, twitchNome = null, channel = discordBotChannel) {
    let args = message.substr(message.indexOf(' ')+1);
    if (args === '!bp') {
        if (voiceJoined) {
            discordVoiceChannel.join().then(connection => {
                if (connection.dispatcher != null) {
                    if (connection.dispatcher.paused) {
                        connection.dispatcher.resume();
                        channel.send("Resumindo musica.");
                    } else {
                        connection.dispatcher.pause();
                        channel.send("Paralizando musica.");
                    }
                }
            });
        }
        return;
    }
    youtube.searchVideos(args,1).then(response => {
        if (discordVoiceChannel === null) {
            console.log("Não foi possivel encontrar o canal de voz!!!");
        } else {
            discordVoiceChannel.join().then(connection => {
                voiceJoined = true;
                let stream = ytdl(response.url, { filter: 'audioonly' });
                let dispatcher = connection.play(stream);
                dispatcher.on('end', () => discordVoiceChannel.leave());
                if (!twitchNome) {
                    channel.send(`Tocando agora ${response.title}`);
                } else {
                    channel.send(`${twitchNome} pediu pela música ${response.title}`);
                }
            }).catch(err => {
                console.log("Não foi possivel conectar ao canal de voz!");
                console.log(err);
            });
        }
    }).catch(err => {
        channel.send("Não foi possivel encontrar!");
    });
}

async function testAll() {
    const video1 = await youtube.getVideo("https://www.youtube.com/watch?v=5NPBIwQyPWE");
    const video2 = await youtube.getVideoByID("5NPBIwQyPWE");
    const video3 = await youtube.searchVideos("big poppa biggie smalls");
    //const videoArray1 = await youtube.getPlaylist("https://www.youtube.com/playlist?list=PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");
    //const videoArray2 = await youtube.getPlaylistByID("PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");
 
    console.log(video1, video2, video3/*, videoArray1, videoArray2*/);
}

client.on('ready', () => {
    discordConnected = true;
    console.log(`${client.user.username} foi inicializado!!`);
    //console.log("Chats encontrados: ");
    //console.log(client.channels);
    client.channels.fetch(process.env.BOT_CHAT_ID).then((response) => {
        discordBotChannel = response;
        console.log("Canal de Texto encontrado no discord!");
    }).catch((error) => {
        console.log(`Canal "${process.env.BOT_CHAT_ID}" não encontrado!`);
        console.log(error);
    });

    client.channels.fetch(process.env.BOT_VOICE_ID).then((response) => {
        discordVoiceChannel = response;
        console.log("Canal de Voz encontrado no discord!");
    }).catch((error) => {
        console.log(`Canal "${process.env.BOT_VOICE_ID}" não encontrado!`);
        console.log(error);
    });
});
client.on('message', (message) => {
    if (message.author.bot) return;
    console.log(message.content);
    if (message.content.startsWith(`!bp`)) {
        pedirMusica(message.content,null,message.channel);
    }
});
client.login(process.env.DISCORDJS_BOT_TOKEN);

const twitchClient = new tmi.client({
    options: {
        debug: true
    },
    connection: {
        cluster: 'aws',
        reconnect: true
    },
    identity: {
        //usuario do twitch
        username: process.env.TWITCH_BOT_USER, 
        //login twitchapps.com/tmi
        password: process.env.TWITCH_BOT_PASS
    },
    channels: [twitchChannelName]
});
twitchClient.connect();
twitchClient.on('connected', (address,port) => {
    twitchConnected = true;
    console.log("Twitch connected!");
});
twitchClient.on('chat', (channel, user, message, self) => {
    if (message.startsWith('!bp')) {
        if (!discordConnected) {
            console.log("O discord não conectou!");
            twitchClient.action(channel, 'Não foi posível a comunicação com o Discord!');
        } else {
            if (discordBotChannel === null) {
                console.log("Chat do discord não encontrado!");
                twitchClient.action(channel, 'O Chat do discord não pode ser encontrado!');
            } else {
                pedirMusica(message,user['display-name']);
            }
        }
    }
})