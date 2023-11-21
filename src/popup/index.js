const btn1 = document.querySelector(`.btn-1`)
btn1.addEventListener('click', () => {
  window.open("https://www.csspicker.dev/?utm_source=svgdownloader-popup", '_blank')
})

const btn2 = document.querySelector(`.btn-2`)
btn2.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentUrl = tabs[0].url
    chrome.runtime.sendMessage({
      type: 'popup-click-download-svg',
      url: currentUrl
    })
  })
})