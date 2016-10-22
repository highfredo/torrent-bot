/*******
 rename to config.js
 *******/

module.exports =
{
    defaults: {
        seedbox: 'transmission',
        tracker: 'elitetorrent'
    },
    transmission: {
        user: "<transmission user>",
        pass: "<transmission pass>",
        rpc: "http://<transmission host>:<transmission port>/transmission/rpc"
    },
    telegram: {
        token: '<telegram token>',
        userId: 0 // <telegram userId>
    }
}