const isProd = import.meta.env.PROD
const preFix = ['%c[svg downloader plugin]:', 'color: red']
export default {
  error: (...args: any[]) => {
    console.log(...preFix, ...args)
  },
  info: (...args: any[]) => {
    if (!isProd) {
      console.log(...preFix, ...args)
    }
  },
}
