# bortexbot
A Twitch-Discord bot that plays music on your Discord server via Twitch chat commands.

### Dependencias usadas:
```
discord.js --APi do discord
tmi.js --API do twitch
discord-youtube-api --API do youtube para discord
ytdl-core --Download de videos do youtube
@discordjs/opus ffmpeg fluent-ffmpeg --coisas para o stream da musica
dotenv (opcional) --Variaveis de ambiente
nodemon (opcional) --Não precisar reiniciar o node na mão
```

### Comandos para facilitar a vida:
<pre>
npm init -y
npm i discord.js
npm i dotenv
npm i tmi.js
npm i discord-youtube-api
npm i ytdl-core
npm i @discordjs/opus ffmpeg fluent-ffmpeg
npm i -g nodemon (opcional)
</pre>

### Comandos de inicialização:
<pre>
node src/bot.js
nodemon src/bot.js
</pre>

### Sites úteis:
```
https://discord.com/api/oauth2/authorize?client_id=<seuCID>&scope=bot
```
* https://discord.com/developers/applications
* http://twitchapps.com/tmi
* https://discord.js.org/?source=post_page---------------------------#/docs/main/stable/general/welcome
* https://github.com/tmijs/tmi.js#readme
* https://console.developers.google.com/
</pre>

### Download ffmpeg:
* https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-4.3.1-2021-01-01-full_build.7z