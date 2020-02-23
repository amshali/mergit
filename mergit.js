var argv = require('optimist')
    .default('port', 9898)
    .string('local')
    .string('remote')
    .string('merged')
    .demand(['local', 'remote', 'merged'])
    .argv;

console.log('Local: ' + argv.local);
console.log('Remote: ' + argv.remote);
console.log('Merged: ' + argv.merged);

