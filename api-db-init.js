'use strict'

const fetch = require('node-fetch')
const db    = require('./api-db')
const log   = (...v)=> console.log(...v)
const url   = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

function sanitize(list){
  let update=[]
  list.ListaEESSPrecio.forEach(e=>{
    let provider= { prices:{}, location:{ type: "Point", coordinates:[] } }
    if( !e.Latitud || !e['Longitud (WGS84)'] ) return
    provider.id = +e['IDEESS']
    provider.name= e['Rótulo']
    provider.hour= e['Horario']
    provider.addr= e['Dirección']
    provider.location.coordinates.push( ( typeof e['Longitud (WGS84)']=="string" )? +(e['Longitud (WGS84)'].replace(',','.')) : e['Longitud (WGS84)'] )
    provider.location.coordinates.push( ( typeof e.Latitud=="string" )? +(e.Latitud.replace(',','.')) : e.Latitud )
    Object.keys(e).filter( f=> (f.match(/^Precio/) && e[f]) ).forEach(f=> provider.prices[f.replace('Precio','').trim().replace('  ',' ')]=+e[f].replace(',','.'))
    update.push( provider )
  })
  if( !update.length ) return log("Error: No Stations processed")
  db.updateStations(update)
}
const updList= _=> fetch(url).then( resp=>resp.json() ).then( data=>sanitize(data) ).catch( e=>log("Spain OpenData fetch Err ->",e) )

updList()
setInterval( updList, 3600000 ) // Update every hour

