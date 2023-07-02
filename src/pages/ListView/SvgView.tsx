import { TSVGDATA } from "../../content"
import log from "../../utils/log"
import useAppStore from "../store"

type TImageViewProps = {
  originHtml: string
}
const convertImgToBase64 = (ele: HTMLImageElement) => {
  // 创建一个新的Canvas元素
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // 设置Canvas的宽高与img元素一致
  canvas.width = ele.width;
  canvas.height = ele.height;

  // 将img元素绘制到Canvas上
  //@ts-ignore
  context.drawImage(ele, 0, 0);

  // 将Canvas转换为Base64数据URL
  try {
    const base64Data = canvas.toDataURL('image/png');
    return base64Data
  } catch (e) {
    log.error('img base64Data error', e, ele.src)
    return ''
  }
}

const convertSvgToBase64 = (ele: SVGAElement) => {
  // 将svg元素转换为XML字符串
  const svgData = new XMLSerializer().serializeToString(ele);

  // 将SVG转换为Base64数据URL
  const base64Data = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  return base64Data
}

type TProps = {
  svgData: TSVGDATA
}

export default ({ svgData }: TProps) => {
  return <div>
    {svgData.data}
  </div>
}