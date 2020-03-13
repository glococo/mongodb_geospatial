'use strict'
const Markup = require('telegraf/markup')
const log    = (...v)=> console.log(...v)
const spain  = require('./api-db')

async function getFuels(ctx){
  ctx.session.location= [ctx.message.location.longitude, ctx.message.location.latitude]
  let search= await spain.findStations( ctx.session.location, ctx.session.radio )
  if( search.length ) {
    ctx.session.fuels= search.reduce( (ac,v)=> [...ac,...Object.keys(v.prices).filter(e=>!ac.includes(e))] ,[] )
    return ctx.reply( 'Which type of fuel are you looking for ?', Markup.keyboard(ctx.session.fuels,{columns:2}).oneTime().resize().extra() )
  }
  return ctx.reply(`There are no fuel stations. Increase the radius or search in another position`, Markup.removeKeyboard().resize().extra() )
}

async function getStations(ctx){
  let fuel   = "prices." + ctx.message.text.trim()
  let search = await spain.findCloserStations(ctx.session.location, ctx.session.radio, fuel)

  if( search.length ) {
    for( let e of search ) {
      await ctx.reply(`${e.prices[ctx.message.text.trim()]}€ a ${(e.metersAway/1000).toFixed(2)} kmts : ${e.name}, ${e.addr} (${e.hour})`, Markup.removeKeyboard().resize().extra())
      await ctx.replyWithLocation(e.location.coordinates[1], e.location.coordinates[0])
    }
    return
  }
  return ctx.reply(`Something wrong happend. There are no fuel stations with your selected fuel.`, Markup.removeKeyboard().resize().extra() )
}

async function onMessage(ctx){
  if( ctx.message.location ) return getFuels(ctx)
  if(!ctx.session.location ) return ctx.replyWithHTML('Send me a 📎 Location (Mobile version) inside Spain and I will search the best Station.')
  if( ctx.session.location && ctx.session.fuels.includes(ctx.message.text.trim()) ) return getStations(ctx)
  return ctx.reply(`I can't understand you ! Select the availables fuel types buttons`, Markup.keyboard(ctx.session.fuels,{columns:2}).oneTime().resize().extra() )
}

module.exports= { onMessage }