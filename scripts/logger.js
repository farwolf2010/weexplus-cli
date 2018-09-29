const chalk = require('chalk')
const format = require('util').format
const through = require('through2')
const pretty = require('pretty-hrtime')
/**
 * Prefix.
 */

const prefix = 'weexplus'
const sep = chalk.gray('·')

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

exports.log = function(...args) {
    const msg = format.apply(format, args)
    console.log('[' + chalk.green(prefix) + ']', chalk.white(msg))
}

/**
 * Warning a `message` to the console.
 *
 * @param {String} message
 */

exports.warning = function(...args) {
    const msg = format.apply(format, args)
    console.log('[' + chalk.blue(prefix) + ']', sep, chalk.yellow(msg))
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

exports.fatal = function(...args) {
    if (args[0] instanceof Error) args[0] = args[0].message.trim()
    const msg = format.apply(format, args)
    console.log('[' + chalk.blue(prefix) + ']', sep, chalk.red(msg))
    process.exit(1)
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

exports.success = function(...args) {
    const msg = format.apply(format, args)
    console.log('[' + chalk.blue(prefix) + ']', sep, chalk.green(msg))
}

exports.sep = function() {
    console.log()
}


exports.info = function(...args) {
    const msg = format.apply(format, args)
    console.log('[' + chalk.green(prefix) + ']', sep, chalk.green(msg))
}





