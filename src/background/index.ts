import getAllSvgs from './getAllSvgs'
const isProd = import.meta.env.PROD

const executeScript = async (tabId: any, func: any) => (await chrome.scripting.executeScript({
  target: { tabId },
  func,
}))[0].result;

const listPageUrl = isProd ? '' : 'http://localhost:3033/download-svg-list'
chrome.action.onClicked.addListener(async ({ url }) => {
  if (url === null || url === void 0 ? void 0 : url.includes('chrome://')) {
    chrome.tabs.create({ url: listPageUrl, active: true }, () => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
          chrome.tabs.sendMessage(tabId, {
            data: [],
            url: 'home',
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
  else {
    const { id } = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const data = await executeScript(id, getAllSvgs);
    const url = await executeScript(id, () => document.location.host);
    const origin = await executeScript(id, () => document.location.origin);
    const outMsg = {
      type: 'svg-data',
      payload: {
        data,
        url,
        origin
      }
    }
    chrome.tabs.create({ url: listPageUrl, active: true }, (tab) => {
      const onMsg = (inCommingMsg: any, sender: any) => {
        if (sender.tab?.id !== tab.id || inCommingMsg?.payload?.type !== 'site-load') return
        chrome.tabs.sendMessage(tab.id as number, outMsg);
        chrome.tabs.onUpdated.removeListener(onMsg);
      }
      chrome.runtime.onMessage.addListener(onMsg);
    });
  }
})
export { }
