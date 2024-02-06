
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (tab?.url?.match('https:\/\/.*.backloggd.com\/.*') && changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            message: 'TabUpdated'
        }).then();
    }
});


chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get({enableExtension: true, timeType: "main"}, (storage) => {
        chrome.contextMenus.create({
            id: "enableExtension",
            type: "checkbox",
            title: "Enable Extension",
            contexts: ["action"],
            checked: storage.enableExtension
        });
        chrome.contextMenus.create({
            id: "timeType",
            title: "Default HLTB time to show",
            contexts: ["action"]
        });

        chrome.contextMenus.create({
            id: "main",
            checked: "main" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Main Story",
            contexts: ["action"]
        });
        chrome.contextMenus.create({
            id: "extra",
            checked: "extra" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Main + Extras",
            contexts: ["action"]
        });
        chrome.contextMenus.create({
            id: "completionist",
            checked: "completionist" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Completionist",
            contexts: ["action"]
        });
        chrome.contextMenus.create({
            id: "all",
            checked: "all" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "All Styles",
            contexts: ["action"]
        });

    });

    chrome.contextMenus.onClicked.addListener(function (info) {
        if (info.menuItemId === "enableExtension") {
            chrome.storage.sync.set({"enableExtension": info.checked}).then();
        } else if (info.parentMenuItemId === "timeType" && !info.wasChecked) {
            chrome.storage.sync.set({"timeType": info.menuItemId}).then();
        }
    });


});
