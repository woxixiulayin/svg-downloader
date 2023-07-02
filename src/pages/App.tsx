import { useEffect } from "react"
import useAppStore from "./store"
import log from "../utils/log"
import ListView from './ListView'
export default () => {
  const state = useAppStore(state => state)

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      log.info("receive background data:", message);
      state.setOriginSvgData(message.data)
    });
  }, [])

  return <div>
    <ListView />
  </div>
}