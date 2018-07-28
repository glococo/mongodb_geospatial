'use strict'
const Markup = require('telegraf/markup')
const Scene  = require('telegraf/scenes/base')
const log    = (...v)=> console.log(...v)

const radioEnter = ctx=> ctx.reply(`How many kilometers around you do you want to search? (current value: ${ctx.session.radio/1000} km)`, Markup.keyboard(ctx.db.radTxt,{columns:3}).oneTime().resize().extra() )
const radioLeave = ctx=> ctx.reply(`Your preferences has been saved. (${ctx.session.radio/1000} km)\nNow, send me a 📎 Location`, Markup.removeKeyboard().extra() )
const radioConfig= ctx=> {
  let radio= +ctx.message.text.trim()
  if( !radio || !Number.isInteger(radio) ) return ctx.reply(`Sorry, How many kilometers around you do you want to search?`, Markup.keyboard(ctx.db.radTxt,{columns:3}).oneTime().resize().extra() )
  ctx.session.radio= radio*1000
  return ctx.scene.leave()
}

const radio= new Scene('radio').enter( radioEnter ).leave( radioLeave ).on('text', radioConfig )

module.exports= { radio }
