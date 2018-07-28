'use strict'
const log    = (...v)=> console.log(...v)
const db     = require('./api-db')

function getElapsedTime(elapsed){
  let seconds = Math.floor( elapsed )
  let days    = Math.floor( seconds / 86400 )
  let hours   = Math.floor( seconds % 86400 / 3600 )
  let minutes = Math.floor( seconds % 86400 % 3600 / 60 )
  return `${days} dias, ${hours} horas, ${minutes} minutos`
}

async function logger(ctx,next){
  if( !ctx.session.radio ) ctx.session.radio= ctx.db.radios[2]*1000
  next().catch( e=>log("Next: "+ctx.message,e) )
}

const uptime = ctx => ctx.reply(`Uptime ${getElapsedTime(process.uptime())}.`)
const start  = ctx => ctx.reply(`👋 Hi !\nSend me a 📎 Location inside Spain and I will search the cheapest fuel station in a ${ctx.session.radio/1000} kmts radius.\n\nSend me a /radio command to change your radius search preferences.`)

module.exports= { start, logger, uptime }
