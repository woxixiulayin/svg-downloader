import { useEffect } from "react"
import useAppStore from "./store"

export default () => {
  const state = useAppStore(state => state)
  useEffect(() => {
    console.log('pagesss')
    console.log('chrome.runtime.onMessage.addListener', chrome.runtime.onMessage.addListener)
    chrome.runtime.onMessage.addListener((message) => {
      console.log("Received message from background script:", message);
      state.setOriginSvgData(message.data)
    });
  }, [])
  console.log('state', state)
  return <div>
    {state.originSvgList.map(item => item)}
  </div>
}