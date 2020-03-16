#!/usr/bin/env node
'use strict'

const log     = (...v)=> console.log(...v)
const now     =     _ => `[ ${new Date().toISOString().slice(0,19)} ] : `
const Telegraf= require('telegraf')
const session = require('telegraf/session')
const Stage   = require('telegraf/stage')
const location= require('./api-location')
const scenes  = require('./api-scenes')
const { start, init } = require('./api-command')
const stage   = new Stage([ scenes.radio ], { ttl: 60 })
const radios  = [1, 2, 5, 10, 15, 25]
const bot= new Telegraf( process.env.BOT_TOKEN ) //, { telegram:{ webhookReply: false } } )
bot.context.db= { lastUpdate: null, updating: false, radios:radios, radTxt:radios.reduce((ac,e)=>[...ac,e.toString()],[]) }
bot.use( session() )
   .use( init )
   .use( stage.middleware() )
   .start( start )
   .command('ayuda', start )
   .command('radio', ctx=> ctx.scene.enter('radio') )
   .on('message', location.onMessage )

log( now()+'MongoDB Geospatial Demo working on real data from Spainsh OpenData Portal - Fuel Stations' )

if ( process.env.NOW_REGION ) {
  log( now()+'Launch on Zeit')
  module.exports = (req, res) => {
    let url= req.url
    if( url == '/api?registerWebHook' ) {
      return bot.telegram.setWebhook('https://mongodb-geospatial.now.sh/api')
                         .then( _=> res.write( now()+'Register success, ') )
                         .catch( _=> res.write( now()+'Register failed, ') )
                         .finally( _=> res.end('process ended.') )
    }
    if( url == '/api?test' ) return res.end('A response from another URL')
    if( url == '/api?uptime' ) return res.end( 'VM Uptime: '+getElapsedTime( process.uptime() ) )
    bot.handleUpdate( req.body, res)
  }
} else {

  log( now()+'Bot started in Polling mode' )
  bot.telegram.deleteWebhook().finally( _=> bot.startPolling() )
}

function getElapsedTime(elapsed){
  let tSeconds = Math.floor( elapsed )
  let days     = Math.floor( tSeconds / 86400 )
  let hours    = Math.floor( tSeconds % 86400 / 3600 )
  let minutes  = Math.floor( tSeconds % 86400 % 3600 / 60 )
  let seconds  = Math.floor( tSeconds % 86400 % 3600 % 60 )
  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

