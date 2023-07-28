import { COLLECTOR_FUNC } from "../const";
import log from "../utils/log";

export type TSVGDATA = {
  type: SVGTypeEnum,
  data: string, // img => src, svg => htmlstr
  alt: string,
}

type TSvgFinder = [
  (ele: Element) => boolean, // condition
  (ele: Element) => TSVGDATA, // change ele to base64
]

export enum SVGTypeEnum {
  IMAGESRC = 'image src',
  BACKGROUNDIMG = 'background img',
  INLINE = 'inline',
}


const convertSrcToFullUrl = (src: string) => {
  const origin = window.location.origin

  if (src.indexOf('http') !== -1) {
    return src
  }
  return origin.concat(src.replace(/^\./, ''))
}

const svgFinders: Array<TSvgFinder> = [
  // background is svg case
  [ele => {
    if (ele.tagName !== 'DIV') return false
    const style = window.getComputedStyle(ele)
    const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
    return src.includes('svg')
  }, ele => {
    const style = window.getComputedStyle(ele);
    const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
    return {
      type: SVGTypeEnum.BACKGROUNDIMG,
      alt: '',
      data: convertSrcToFullUrl(src)
    }
  },
  ],
  [
    ele => ele.tagName.toUpperCase() === 'SVG',
    ele => {
      return {
        type: SVGTypeEnum.INLINE,
        alt: '',
        data: ele.outerHTML
      }
    },
  ], [
    //@ts-ignore
    ele => ele.tagName.toUpperCase() === 'IMG' && ele.src.includes('\.svg'),
    (ele) => {
      return {
        type: SVGTypeEnum.IMAGESRC,
        alt: (ele as HTMLImageElement).alt,
        data: convertSrcToFullUrl((ele as HTMLImageElement).src)
      }
    },
  ],
]

function getAllSvgHtml() {
  const allSvgs: Array<TSVGDATA> = []
  Array.from(document.querySelectorAll('*')).forEach(ele => {
    const finder = svgFinders.find(finder => finder[0](ele))
    if (finder) {
      const svgData = finder[1](ele)
      if (!svgData) return
      // unique
      if (allSvgs.find(item => item.data === svgData.data)) return
      allSvgs.push(svgData)
    }
  })

  console.log('allsvgs', allSvgs)
  return [
    ...new Set(allSvgs),
  ];
}

log.info('content loaded')
const onReceiveMessage = (msg: any) => {
  if (msg?.type !== 'svg-data') return
  // 收到一次消息就卸载
  chrome.runtime.onMessage.removeListener(onReceiveMessage)
  log.info("receive background data:", msg);
  let count = 0
  const timer = setInterval(() => {
    if (count > 100) {
      clearInterval(timer)
    }
    count += 1
    const div = document.querySelector('#svg-list-page')
    if (div) {
      clearInterval(timer)
      log.info('find flagdom and send data')
      window.postMessage({
        source: 'svg-downloader',
        payload: msg?.payload || {}
      })
    }
  }, 200)
}

// 当前为download-svg-list时，说明是接收svg数据
if (window.location.pathname.indexOf('download-svg-list') !== -1) {
  chrome.runtime.sendMessage({
    payload: {
      type: 'site-load',
    }
  })
  chrome.runtime.onMessage.addListener(onReceiveMessage);
}