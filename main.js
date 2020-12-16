// STEEZY3000 Discord Bot driver
// Author: Niko R.
// 11/12/2020

const config = require('./config.js');
const { timeStamp } = require('console');
const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const BattleScheduler = require('./BattleScheduler.js');
const { finished } = require('stream');

const prefix = '!';
const client = new Discord.Client();
client.commands = new Discord.Collection();

const battleScheduler = new BattleScheduler();

// updates users-list.txt
function writeUsers(battleScheduler) {
    var writer = fs.createWriteStream(config.user_list_path)
    for (id in battleScheduler.userList) {
        console.log(id + ' ' + battleScheduler.userList[id] + '\n');
        writer.write(id + ' ' + battleScheduler.userList[id] + '\n', (err) => {
            if (err) throw err;
        });
    }

    writer.close();
}

function initSchedule(client) {

    log = "Battle started";
    //battleScheduler.startBattleJob(client, '0 12 * * 5', log)//, announcement);
    battleScheduler.startBattleJob(client, '* * * * *', log)//, announcement);

    log = "Voting started";
    //battleScheduler.startVoteJob(client, '59 23 * * 6', log)//, announcement);
    battleScheduler.startVoteJob(client, '* * * * *', log)//, announcement);

    log = "Battle ended";
    //battleScheduler.endBattleJob(client, '0 20 * * 0', log)//, announcement);
    battleScheduler.endBattleJob(client, '* * * * *', log)//, announcement);
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

    // get updated userlist, if list not empty
    if (fs.readFileSync(config.user_list_path).length != 0) {
        fs.readFile(config.user_list_path, function (err, f) {
            var userList = f.toString().split('\n');
            //console.log(userList);
            //console.log(userList[0]);
            //console.log(userList[1]);
            var userId;
            var userVotes;
            var line;

            for (i = 0; i < userList.length; i++) {

                if (userList[i] != '') {
                    line = userList[i].toString().split(' ')
                    //console.log('line: ' + line);
                    //console.log('userid: ' + line[0]);
                    //console.log('uservotes: ' + line[1]);

                    userId = line[0];
                    userVotes = line[1];

                    battleScheduler.userList[userId] = userVotes;
                }

                console.log(battleScheduler.userList)
            }
        });
    }

    // parse command and args
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping')
        client.commands.get('ping').execute(message, args);

    // track submit
    else if (command === 'submit') {

        // check if submit is open
        console.log(message.author.id + ' attempted submit');
        console.log('Submit is ' + battleScheduler.isSubmitOpen);
        if (!battleScheduler.isSubmitOpen)
            message.channel.send('Sorry, submissions are currently closed');

        // block user from submitting twice
        else if (battleScheduler.userList.hasOwnProperty(args))
            message.channel.send('Sorry, you have already submitted');

        // add user to userlist
        else if (args.length != 0 && args.length < 2) {
            client.commands.get('submit').execute(client, message, args);

            // add user in memory
            userId = '<@!' + message.author.id + '>';
            battleScheduler.userList[userId] = 0;

            console.log('userlist: ' + battleScheduler.userList)
            writeUsers(battleScheduler);
        }

        // err
        else
            message.channel.send('Something went wrong. Please type \'!submit [soundcloud-url]\' to submit');

        console.log('submit executed');
    }

    // track vote
    else if (command === 'vote') {

        // check if voting is open
        console.log(message.author.id + ' attempted vote');
        console.log('Voting is ' + battleScheduler.isVoteOpen);
        if (!battleScheduler.isVoteOpen)
            message.channel.send('Sorry, voting is currently closed');

        // block user from voting again
        else if (battleScheduler.userHasVoted.includes(message.author.id))
            message.channel.send('Sorry, you have already voted');

        // add vote for a user
        else if (args.length != 0 && args.length < 2) {


            if (battleScheduler.userList.hasOwnProperty(args)) {
                battleScheduler.userList[args]++;
                battleScheduler.userHasVoted.push(message.author.id)

                writeUsers(battleScheduler);

                client.commands.get('vote').execute(client, message, args);
            }
            else
                message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
        }

        // err
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

    else if (command === 'open-submit') {
        if (message.member.roles.cache.find(r => r.name === "Big Chief")) {
            battleScheduler.isSubmitOpen = true;
            battleScheduler.isVoteOpen = false;
            console.log('Submit now open')
        }
        else
            message.channel.send('Sorry you\'re not allowed to do that');
    }
    else if (command === 'open-vote') {
        if (message.member.roles.cache.find(r => r.name === "Big Chief")) {
            battleScheduler.isSubmitOpen = false;
            battleScheduler.isVoteOpen = true;
            console.log('Vote now open')

        }
        else
            message.channel.send('Sorry you\'re not allowed to do that');
    }
    else if (command === 'submit-d') {
        console.log(message.author.id + ' attempted submit');

        client.channels.cache.get(config.submit_channel_id).send(args[0] + ' -- ' + args[1])
        
        battleScheduler.userList[args[0]] = 0;

        console.log('userlist: ' + battleScheduler.userList)
        writeUsers(battleScheduler);

        console.log('submit executed');
    }

    else if (command === 'vote-d') {

        // add vote for a user
        if (args.length != 0 && args.length < 2) {

            if (battleScheduler.userList.hasOwnProperty(args)) {
                battleScheduler.userList[args]++;
                battleScheduler.userHasVoted.push(message.author.id)

                writeUsers(battleScheduler);

                client.commands.get('vote').execute(client, message, args);
            }
            else
                message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
        }

        // err
        else {
            message.channel.send('Something went wrong. Please type \'!vote @user\' to vote');
            console.log('vote executed');
        }
    }

    else if (command === 'end-d') {
        
    
    }
});

//else if (command === 'winner') {
//message.channel.send(getWinner(battleScheduler.userList));
//}

client.login(config.bot_token);

