// STEEZY3000 Discord Bot driver
// Author: Niko R.
// 11/12/2020

const config = require('./config.js');
const { timeStamp } = require('console');
const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const BattleScheduler = require('./BattleScheduler.js');

const sampleList = [
    'https://www.youtube.com/watch?v=_fL-ZigeB4o',
    'https://www.youtube.com/watch?v=1W9NUu9s27o',
    'https://www.youtube.com/watch?v=XaC7braEJ1w'
]

const prefix = '!';
const client = new Discord.Client();
client.commands = new Discord.Collection();

const battleScheduler = new BattleScheduler();

function initSchedule(client) {

    var announcement = new Discord.MessageEmbed()
        .setColor(config.embed_color)
        .setTitle('🥁 Weekly Beat Battle 🥁')// + battleNum)
        .setDescription(' <@&' + config.everyone + '> IT\'S TIME FOR ANOTHER WEEKLY BEAT BATTLE 🔥\n\n\
        Brandish ya DAW, invite a friend, we bout to fl!p')
        .addFields(
            { name: 'HOW TO SUBMIT', value: 'Type \'!submit [soundcloud-url]\' \n Your URL must follow the standard format: https://soundcloud.com/nikorosy/example-track' },
            {
                name: 'RULES', value:
                    '1️⃣   Use only the provided sample\n\
        2️⃣   You may use your own drums/instruments but the sample must be prominent\
        3️⃣   If you submit, you MUST vote\n\
        4️⃣   Bring the heat!!!'},
            { name: 'THIS WEEK\'S SAMPLE', value: sampleList[Math.floor(Math.random() * sampleList.length)] },
            { name: 'BATTLE START', value: 'Friday 12:00PM PST', inline: true },
            { name: 'BATTLE END', value: 'Saturday 11:59PM PST', inline: true },
            { name: 'Follow us on IG', value: 'https://www.instagram.com/steezyproducers' },
        )
        .setTimestamp()
        .setFooter('👁');

    log = "Battle started";
    battleScheduler.startBattleJob(client, '0 12 * * 5', log, announcement);
    //battleScheduler.startBattleJob(client, '* * * * *', log, announcement);

    announcement = new Discord.MessageEmbed()
        .setColor(config.embed_color)
        .setTitle('🥁 Weekly Beat Battle 🥁')
        .setDescription(' <@&' + config.everyone + '> VOTING BEGINS NOW\n\n')
        .addFields(
            { name: 'HOW TO VOTE', value: 'Type !vote @user' },
            { name: 'VOTE START', value: 'Saturday 11:59PM PST', inline: true },
            { name: 'VOTE END', value: 'Sunday 8:00PM PST', inline: true },
            { name: 'INSTAGRAM', value: 'https://www.instagram.com/steezyproducers' },
        )

        .setFooter('👁');

    log = "Voting started";
    battleScheduler.startVoteJob(client, '59 23 * * 6', log, announcement);
    //battleScheduler.startVoteJob(client, '7 * * * *', log, announcement);

    announcement = new Discord.MessageEmbed()
        .setColor(config.embed_color)
        .setTitle('🥁 Weekly Beat Battle 🥁')
        .addFields(
            //{ name: 'WINNING BEAT', value: '[url]', inline: true },
            { name: 'INSTAGRAM', value: 'https://www.instagram.com/steezyproducers' },
        )
        .setTimestamp()
        .setFooter('👁');

    log = "Battle ended";
    battleScheduler.endBattleJob(client, '0 20 * * 0', log, announcement);
    //battleScheduler.endBattleJob(client, '* * * * *', log, announcement);
};

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// bot status
client.once('ready', () => {
    console.log('STEEZY3000 is online');
    console.log('Starting cron jobs...');
    initSchedule(client);
    console.log('Cron jobs started');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // ping
    if (command === 'ping')
        client.commands.get('ping').execute(message, args);

    // track submit
    else if (command === 'submit') {
        console.log(message.author.id + ' attempted submit');
        console.log('Submit is ' + battleScheduler.isSubmitOpen);
        if (!battleScheduler.isSubmitOpen)
            message.channel.send('Sorry, submissions are currently closed');
        else if (battleScheduler.userList.hasOwnProperty(args))
            message.channel.send('Sorry, you have already submitted');
        else if (args.length != 0 && args.length < 2) {
            client.commands.get('submit').execute(client, message, args);
            battleScheduler.userList['<@!' + message.author.id + '>'] = 0;
        }
        else
            message.channel.send('Something went wrong. Please type \'!submit [soundcloud-url]\' to submit');

        console.log('submit executed');
    }

    // track vote
    else if (command === 'vote') {
        console.log(message.author.id + ' attempted vote');
        console.log('Voting is ' + battleScheduler.isVoteOpen);
        if (!battleScheduler.isVoteOpen)
            message.channel.send('Sorry, voting is currently closed');
        else if (battleScheduler.userHasVoted.includes(message.author.id))
            message.channel.send('Sorry, you have already voted');
        else if (args.length != 0 && args.length < 2) {
            client.commands.get('vote').execute(client, message, args);

            if (battleScheduler.userList.hasOwnProperty(args)) {
                battleScheduler.userList[args]++;
                battleScheduler.userHasVoted.push(message.author.id)
            }
            else
                message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
        }
        else {
            message.channel.send('Something went wrong. Please type \'!vote @user\' to vote');
            console.log('vote executed');
        }
    }

    // debug display
    else if (command === 'display') {
        for (var key in battleScheduler.userList) {
            // check if the property/key is defined in the object itself, not in parent
            if (battleScheduler.userList.hasOwnProperty(key)) {
                console.log(key, battleScheduler.userList[key]);
            }
        }
    }

    //else if (command === 'winner') {
    //message.channel.send(getWinner(battleScheduler.userList));
    //}
});

client.login(config.bot_token);

