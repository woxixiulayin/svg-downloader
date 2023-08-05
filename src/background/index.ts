const isProd = import.meta.env.PROD

const checkContent = () => {
  const div = document.querySelector('#svg-downloader-dom')
  return !!div
}

const executeScript = async (tabId: any, func: any) => (await chrome.scripting.executeScript({
  target: { tabId },
  func,
}))[0].result;

const listPageUrl = isProd ? 'https://www.svgdownloader.com/download-svg-list' : 'http://localhost:3033/download-svg-list'
// const listPageUrl = 'https://www.svgdownloader.com/download-svg-list'
const openSvgListWithData = (outMsg: any) => chrome.tabs.create({ url: listPageUrl, active: true }, (tab) => {
  const onMsg = (inCommingMsg: any, sender: any) => {
    if (sender.tab?.id !== tab.id || inCommingMsg?.type !== 'svg-downloader-page-load') return
    chrome.runtime.onMessage.removeListener(onMsg);
    chrome.tabs.sendMessage(tab.id as number, {
      type: 'svg-downloader-svg-data',
      payload: outMsg
    });
  }
  chrome.runtime.onMessage.addListener(onMsg);
});

const createEmptyPage = () => {
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

// get svg data from target page
const getCollectData = async (tabId: number) => {
  return new Promise((res) => {
    const listener = (inCommingMsg: any, sender: any) => {
      if (inCommingMsg?.type !== 'svg-downloader-collected-svg-data') return
      chrome.runtime.onMessage.removeListener(listener)
      res(inCommingMsg.payload)
    }

    chrome.runtime.onMessage.addListener(listener)
    chrome.tabs.sendMessage(tabId, { type: 'svg-downloader-collect-svg' });
  })
}

// send svg data to new Page
const sendDataToNewPage = (dataPromise: Promise<any>) => {
  chrome.tabs.create({ url: listPageUrl, active: true }, (tab) => {
    const onMsg = async (inCommingMsg: any, sender: any) => {
      if (sender.tab?.id !== tab.id || inCommingMsg?.type !== 'svg-downloader-page-load') return
      chrome.runtime.onMessage.removeListener(onMsg);
      const data = await dataPromise
      chrome.tabs.sendMessage(tab.id as number, {
        type: 'svg-downloader-svg-data',
        payload: data
      });
    }
    chrome.runtime.onMessage.addListener(onMsg);
  });
}

chrome.action.onClicked.addListener(async ({ url }) => {
  if (!url || url.includes('chrome://')) {
    createEmptyPage()
  }
  else {
    const { id } = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    // check if first time
    const isContentInject = await executeScript(id, checkContent)
    if (!isContentInject) {
      openSvgListWithData({
        data: [],
        url: '',
        origin: '',
      })
      return
    }

    // const listener = (inCommingMsg: any, sender: any) => {
    //   if (inCommingMsg?.type !== 'svg-downloader-collected-svg-data') return
    //   chrome.runtime.onMessage.removeListener(listener)
    //   openSvgListWithData(inCommingMsg.payload)
    // }

    // chrome.runtime.onMessage.addListener(listener)
    // chrome.tabs.sendMessage(id as number, { type: 'svg-downloader-collect-svg' });
    sendDataToNewPage(getCollectData(id as number))
  }
})
export { }
