const isProd = import.meta.env.PROD
// const isProd = false

// content file is compile by vite handful
const contentJs = 'content_script.js'
const executeContentScript = (tabId: number) => chrome.scripting.executeScript({
  target: { tabId },
  files: [contentJs],
})

// const listPageUrl = isProd ? 'https://www.svgdownloader.com/download-svg-list' : 'http://localhost:3033/download-svg-list'
const listPageUrl = 'https://www.svgdownloader.com/download-svg-list'

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

const waitTabMsg = async (tabId: number, msgChecker: Function) => {
  return new Promise((res) => {
    const listener = (inCommingMsg: any, sender: any) => {
      if (sender.tab?.id !== tabId || !msgChecker(inCommingMsg)) return
      chrome.runtime.onMessage.removeListener(listener)
      res(inCommingMsg)
    }

    chrome.runtime.onMessage.addListener(listener)
  })
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
    // wait target page load content js
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { type: 'svg-downloader-collect-svg' });
    }, 500);
  })
}

// send svg data to new Page
const sendDataToNewPage = (dataPromise: Promise<any>) => {
  chrome.tabs.create({ url: listPageUrl, active: true }, (tab) => {
    executeContentScript(tab.id as number)
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

const onDownloadSvgClick = async ({ url }: any) => {
  if (!url || url.includes('chrome://')) {
    createEmptyPage()
  }
  else {
    const id = (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id as number;
    // will inject script  once ,chrome did this
    await executeContentScript(id as number)
    // wait target page load content js
    setTimeout(() => {
      chrome.tabs.sendMessage(id, { type: 'svg-downloader-collect-svg' });
    }, 500);
  }
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'popup-click-download-svg') {
    onDownloadSvgClick({ url: msg.url })
  }
})


// chrome.action.onClicked.addListener(async ({ url }) => {
//   if (!url || url.includes('chrome://')) {
//     createEmptyPage()
//   }
//   else {
//     const id = (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id as number;
//     // will inject script  once ,chrome did this
//     await executeContentScript(id as number)
//     // wait target page load content js
//     setTimeout(() => {
//       chrome.tabs.sendMessage(id, { type: 'svg-downloader-collect-svg' });
//     }, 500);
//   }
// })
export { }
