let genericBrowser = chrome ? chrome : browser;
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (tab?.url?.match('https:\/\/.*.backloggd.com\/.*') && changeInfo.status === 'complete') {
        genericBrowser.tabs.sendMessage(tabId, {
            message: 'TabUpdated'
        }).then();
    }
});


genericBrowser.runtime.onInstalled.addListener(function () {
    genericBrowser.storage.sync.get({enableExtension: true, timeType: "main"}).then(storage => {
        genericBrowser.contextMenus.create({
            id: "enableExtension",
            type: "checkbox",
            title: "Enable Extension",
            contexts: ["action"],
            checked: storage.enableExtension
        });
        genericBrowser.contextMenus.create({
            id: "timeType",
            title: "Default HLTB time to show",
            contexts: ["action"]
        });

        genericBrowser.contextMenus.create({
            id: "main",
            checked: "main" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Main Story",
            contexts: ["action"]
        });
        genericBrowser.contextMenus.create({
            id: "extra",
            checked: "extra" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Main + Extras",
            contexts: ["action"]
        });
        genericBrowser.contextMenus.create({
            id: "completionist",
            checked: "completionist" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "Completionist",
            contexts: ["action"]
        });
        genericBrowser.contextMenus.create({
            id: "all",
            checked: "all" === storage.timeType,
            type: "radio",
            parentId: "timeType",
            title: "All Styles",
            contexts: ["action"]
        });

    });

    genericBrowser.contextMenus.onClicked.addListener(function (info) {
        if (info.menuItemId === "enableExtension") {
            chrome.storage.sync.set({"enableExtension": info.checked}).then();
        } else if (info.parentMenuItemId === "timeType" && !info.wasChecked) {
            chrome.storage.sync.set({"timeType": info.menuItemId}).then();
        }
    });


});
