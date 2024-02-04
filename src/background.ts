chrome.runtime.onMessage.addListener(
    (url, sender, onSuccess) => {
        fetch(url).then(response => response.json()).then(value => onSuccess(value));
        return true;
    }
);

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (tab?.url?.match('https:\/\/.*.backloggd.com\/.*') && changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            message: 'TabUpdated'
        }).then();
    }
});