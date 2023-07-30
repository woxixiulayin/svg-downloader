const isProd = import.meta.env.PROD
const preFix = ['%c[svg downloader plugin]:', 'color: red']
const log = {
  error: (...args: any[]) => {
    console.log(...preFix, ...args)
  },
  info: (...args: any[]) => {
    if (!isProd) {
      console.log(...preFix, ...args)
    }
  },
}


export type TSVGDATA = {
  type: SVGTypeEnum,
  data: string, // img => src, svg => htmlstr
  alt: string,
}

type TSvgFinder = [
  (ele: Element) => boolean, // condition
  (ele: Element) => Promise<TSVGDATA>, // change ele to base64
]

export enum SVGTypeEnum {
  IMAGESRC = 'image src',
  BACKGROUNDIMG = 'background img',
  INLINE = 'inline',
}


const convertSrcToSvgHtml = async (src: string) => {
  // src为链接
  if (src.startsWith('/') || src.startsWith('http')) {
    return fetch(src).then(res => res.text()).catch(() => {
      return ''
    })
  }
  // src为svg的decode内容
  return decodeURIComponent(src.replace(/^data\:image\/svg\+xml[,;]/, ''))
}

const svgFinders: Array<TSvgFinder> = [
  // background is svg case, data will be url or start with `data:image/svg+xml`
  [ele => {
    const style = window.getComputedStyle(ele)
    // src格式为url("***")，需要提取内部内容
    const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
    return src.includes('data:image/svg+xml') || src.includes('\.svg')
  }, async (ele) => {
    const style = window.getComputedStyle(ele);
    const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
    return convertSrcToSvgHtml(src).then(data => ({
      type: SVGTypeEnum.BACKGROUNDIMG,
      alt: '',
      data,
    }))
  },
  ],
  [
    ele => ele.tagName.toUpperCase() === 'SVG',
    async ele => {
      return {
        type: SVGTypeEnum.INLINE,
        alt: '',
        data: ele.outerHTML,
      }
    },
  ], [
    //@ts-ignore
    // img src is svg, data will be url or start with `data:image/svg+xml`
    ele => ele.tagName.toUpperCase() === 'IMG' && (ele.src.includes('data:image/svg+xml') || ele.src.includes('\.svg')),
    async (ele) => {
      return convertSrcToSvgHtml((ele as HTMLImageElement).src).then(data => ({
        type: SVGTypeEnum.IMAGESRC,
        alt: (ele as HTMLImageElement).alt,
        data
      }))
    },
  ],
]

async function getAllSvgData() {
  const allSvgs: Array<Promise<TSVGDATA>> = []
  Array.from(document.querySelectorAll('*')).forEach(ele => {
    const finder = svgFinders.find(finder => finder[0](ele))
    if (finder) {
      const svgData = finder[1](ele)
      if (!svgData) return
      allSvgs.push(svgData)
    }
  })

  const allSvgResult = await Promise.all(allSvgs)
  console.log('allSvgResult', allSvgResult)
  const uniqueRes: TSVGDATA[] = []
  for (let res of allSvgResult) {
    // 空内容或者跨域导致的不能访问的内容
    if (!res.data) continue
    // 剔除一样的内容
    if (uniqueRes.find(item => item.data === res.data)) continue
    uniqueRes.push(res)
  }
  return uniqueRes;
}

log.info('content loaded')

const isSvgListPage = window.location.pathname.indexOf('download-svg-list') !== -1

// 用于检查当前页面是否注入content
const createFlagDom = () => {
  const div = document.createElement('div')
  div.id = 'svg-downloader-dom'
  document.body.appendChild(div)
}
createFlagDom()

if (!isSvgListPage) {
  log.info('isSvgListPage', isSvgListPage)
  const listener = async (msg: any) => {
    log.info('receive msg', msg)
    if (msg.type !== 'svg-downloader-collect-svg') return

    const data = await getAllSvgData()
    log.info('receive svg-downloader-collect-svg')
    chrome.runtime.sendMessage({
      type: 'svg-downloader-collected-svg-data',
      payload: {
        data,
        url: location.href,
        origin: location.origin
      }
    })
  }

  // 只会受到插件单独发给某个页面的消息，所以不用removelistener
  chrome.runtime.onMessage.addListener(listener);

}

// 当前为download-svg-list时，说明是接收svg数据
if (isSvgListPage) {

  const onReceiveMessage = (msg: any) => {
    if (msg?.type !== 'svg-downloader-svg-data') return
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
          type: 'svg-downloader-svg-data',
          payload: msg?.payload || {}
        })
      }
    }, 200)
  }
  chrome.runtime.sendMessage({
    type: 'svg-downloader-page-load'
  })
  chrome.runtime.onMessage.addListener(onReceiveMessage);
}

