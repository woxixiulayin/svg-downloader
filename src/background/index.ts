type TSvgFinder = [
  (ele: Element) => boolean, // condition
  (ele: Element) => string, // parser
]

function getAllSvgHtml() {
  const svgFinders: Array<TSvgFinder> = [
    [ele => {
      if (ele.tagName !== 'DIV') return false
      const style = window.getComputedStyle(ele)
      const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
      return src.includes('svg')
    }, ele => {
      const style = window.getComputedStyle(ele);
      const src = style.backgroundImage.slice(4, -1).replace(/"/g, '');
      const image = new Image();
      image.src = src;
      return image.outerHTML;
    },
    ], [
      ele => ele.tagName === 'SVG',
      ele => ele.outerHTML,
    ], [
      ele => ele.tagName === 'IMG' && ele.outerHTML.includes('\.svg'),
      ele => ele.outerHTML,
    ],
  ]
  const getAllSvgs = () => {
    const svgs = [] as any
    Array.from(document.querySelectorAll('*')).forEach(ele => {
      const finder = svgFinders.find(finder => finder[0](ele))
      if (finder) {
        svgs.push(finder[1](ele))
      }
    })
    return svgs
  }

  const allSvgs = getAllSvgs()
  return [
    ...new Set(allSvgs),
  ];
}

const executeScript = async (tabId, func) => (await chrome.scripting.executeScript({
  target: { tabId },
  func,
}))[0].result;

chrome.action.onClicked.addListener(async ({ url }) => {
  if (url === null || url === void 0 ? void 0 : url.includes('chrome://')) {
    chrome.tabs.create({ url: `/pages/page.html`, active: true }, () => {
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
    const data = await executeScript(id, getAllSvgHtml);
    const url = await executeScript(id, () => document.location.host);
    const location = await executeScript(id, () => document.location.origin);
    chrome.tabs.create({ url: `./pages/index.html`, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              data,
              url,
              location
            });
          }, 500);
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
})
export { }
