const isProd = import.meta.env.PROD
export default {
  error: (...args: any[]) => {
    console.log(...args)
  },
  info: (...args: any[]) => {
    if (!isProd) {
      console.log(...args)
    }
  },
}
