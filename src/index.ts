
import * as Rx from "rxjs/Rx";
import {Pelicula, VivaTorrent} from "./Vivatorrent";
import {Telegram} from "./Telegram";
import {Transmission} from "./Transmission";
import config from './config'


let vivatorrent = new VivaTorrent()
let transmission = new Transmission(config.transmission)
let telegram = new Telegram(config.telegram, vivatorrent, transmission)

Rx.Observable.timer(0, 3600000 /*1hr*/).flatMap(() => {
  return Rx.Observable.fromPromise(vivatorrent.peliculas())
}).subscribe((pelis: Pelicula[]) => {
  telegram.sendPelis(pelis)
})
