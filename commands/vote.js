const Discord = require('discord.js');

module.exports = {
    name: 'vote',
    desc: 'this is a vote command',

    execute(client, message, battleScheduler, args) {

        // test channel
        // const CHANNEL_ID = '775904842135765033';

        console.log(message.author.id + ' attempted vote');
        console.log('Voting is ' + battleScheduler.isVoteOpen);

        if (!battleScheduler.isVoteOpen)
            message.channel.send('Sorry, voting is currently closed');

        else if (battleScheduler.userHasVoted.includes(message.author.id))
            message.channel.send('Sorry, you have already voted');

        else if (battleScheduler.userList.hasOwnProperty(args)) {
            battleScheduler.userList[args]++;
            battleScheduler.userHasVoted.push(message.author.id)

            // send submitted track to vote channel
            //client.channels.cache.get(CHANNEL_ID)
            message.channel.send('<@!' + message.author.id + '> voted for ' + args);
        }
        else
            message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
    }
}