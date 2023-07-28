export type TSVGDATA = {
  type: SVGTypeEnum,
  data: string, // img => src, svg => htmlstr
  alt: string,
}
export enum SVGTypeEnum {
  IMAGESRC = 'image src',
  BACKGROUNDIMG = 'background img',
  INLINE = 'inline',
}

type TSvgFinder = [
  (ele: Element) => boolean, // condition
  (ele: Element) => TSVGDATA, // change ele to base64
]


const getAllSvg = () => {
  const convertSrcToFullUrl = (src: string) => {
    const origin = window.location.origin

    if (src.indexOf('http') !== -1) {
      return src
    }
    return origin.concat(src.replace(/^\./, ''))
  }

  // svg处理器，每个元素包含如何匹配元素和转换元素的函数
  const svgParsers: Array<TSvgFinder> = [
    // 背景图片为svg的，返回svg url
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
    // svg元素，返回svg信息
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
      // 背景图片为svg的，返回svg url
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
      const finder = svgParsers.find(finder => finder[0](ele))
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

  return getAllSvgHtml()
}

export default getAllSvg