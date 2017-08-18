
import * as Cheerio from "cheerio";
import fetch from 'node-fetch'
import {Iconv} from 'iconv'

const uuidv4 = require('uuid/v4');
const low = require('lowdb');
const lowFileAsync = require('lowdb/lib/storages/file-async')


export class Link {
  id: string
  fuente: string
  quality: string
  size: string
  url: string
  isNew: boolean
}

export class Pelicula {
  title: string
  release_date: Date
  photo: string
  description: string
  links: Link[]
  public hasNewLinks(): boolean {
    return !!this.links.find((l) => l.isNew === true)
  }
  // season: seasonEpisode.season,
  // episode: seasonEpisode.episode
}

export class VivaTorrent {
  private db
  private iconv: Iconv

  constructor() {
    this.db = low('db.json', { storage: lowFileAsync })
    this.db.defaults({links: []}).write()
    this.iconv = new Iconv('latin1', 'UTF-8')
  }

  async peliculas(): Promise<Pelicula[]> {
    let pelis = await this.fetchPeliculas('http://www.vivatorrents.com/')
    return pelis.filter((peli) => peli.hasNewLinks())
  }

  async search(q: string): Promise<Pelicula[]> {
    return this.fetchPeliculas(`http://www.vivatorrents.com/?pTit=${q}&pOrd=FE`)
  }

  async getTorrentFile(linkId: string): Promise<Buffer> {
    let link = this.db.get('links').find({id: linkId}).value()
    let response = await fetch('http://anonymouse.org/cgi-bin/anon-www.cgi/' + link.url)

    return response.buffer()
  }


  /*
    PRIVATE
  */
  private async fetchPeliculas(url: string): Promise<Pelicula[]> {
    let response = await this.latin1Fetch(url)

    let $ = Cheerio.load(response)
    let elements = $('.moviesbox:not(.more) a').toArray()

    let pelis_html = await Promise.all(elements.map((element) => {
      return this.latin1Fetch(element.attribs.href)
    }))

    return pelis_html.map((html) => {
      return this.parsePeliculaPage(html)
    })
  }

  private async latin1Fetch(url: string): Promise<string> {
    let response = await fetch(url)
    let buffer   = await response.buffer()
    return this.iconv.convert(buffer).toString()
  }

  private parsePeliculaPage(html): Pelicula {
    let $ = Cheerio.load(html)
    let pelicula = new Pelicula()

    let release_date_parts = $('[itemprop="datePublished"]').text().split('.').map((p) => {
      return Number(p)
    })

    // pelicula.id = $('[itemprop="url"]').prop('content').split('descargar-torrent-')[1]
    pelicula.title = $('h1[itemprop="name"]').text()
    pelicula.release_date = new Date(release_date_parts[2], release_date_parts[1] - 1, release_date_parts[0])
    pelicula.photo = $('[itemprop="image"]').prop('src')
    pelicula.description = $('[itemprop="description"]').text()

    pelicula.links = $('.detail_torrents span').toArray().map((element: CheerioElement, index: number) => {
      let span = $('.detail_torrents span').eq(index)

      let link = new Link()
      let i = span.find('i')
      link.quality = i.first().text().trim()
      link.fuente = span.find('a.dload').text().trim()
      link.size = $(i.get(1)).text().trim()

      link.url = span.find('a').first().attr('href').split(',')[2].match(/'(.*)'/)[1]
      let linkExist = this.db.get('links').find({url: link.url}).value()
      link.isNew = !linkExist
      if(linkExist) {
        link.id = linkExist.id
      } else {
        link.id = uuidv4()
        this.db.get('links').push({id: link.id, url: link.url, data: Date.now()}).write()
      }

      return link
    })

    return pelicula
  }
}
