chrome.runtime.onMessage.addListener(
    function (url, sender, onSuccess) {
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

chrome.runtime.onInstalled.addListener(function () {

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        console.log(JSON.stringify(changeInfo));
        if (changeInfo.status === 'complete') {
            chrome.tabs.sendMessage(tabId, {
                message: 'TabUpdated'
            });
        }
    })
});