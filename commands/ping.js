module.exports = {
    name: 'ping',
    desc: 'this is a ping command',
    
    execute(message, args){
        message.channel.send('pong');    
    }
}