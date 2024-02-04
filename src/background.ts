chrome.runtime.onMessage.addListener(
    (url, sender, onSuccess) => {
        fetch(url, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(value => onSuccess(value));

        return true;
    }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            message: 'TabUpdated'
        });
    }
});