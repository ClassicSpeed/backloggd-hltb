
let genericBrowser = chrome ? chrome : browser;


genericBrowser.runtime.onInstalled.addListener(generateMenu);

genericBrowser.runtime.onStartup.addListener(generateMenu);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    const {url, method, headers, body} = message.payload;

    fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} when fetching ${url}`);
            }
            const data = await response.json();
            sendResponse({success: true, data});
        })
        .catch((error) => {
            sendResponse({success: false, error: error.message});
        });

    return true;

});
chrome.runtime.onInstalled.addListener(() => {

    const rules: any = [
        {
            "id": 1,
            "priority": 1,
            "action": {
                "type": "modifyHeaders",
                "requestHeaders": [
                    { "header": "Referer", "operation": "set", "value": "https://howlongtobeat.com" },
                    { "header": "Origin", "operation": "set", "value": "https://howlongtobeat.com" }
                ]
            },
            "condition": {
                "urlFilter": "||howlongtobeat.com/*",
                "resourceTypes": ["xmlhttprequest", "main_frame", "sub_frame"]
            }
        }
    ]
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
        removeRuleIds: rules.map((rule:any) => rule.id),
    });
});
function generateMenu() {
    genericBrowser.storage.sync.get({
        enableExtension: true,
        timeType: "main",
        badgePosition: "topRight"
    }).then(storage => {

        genericBrowser.contextMenus.removeAll(() => {
            genericBrowser.contextMenus.create({
                id: "enableExtension",
                type: "checkbox",
                title: "Enable Extension",
                contexts: ["action"],
                checked: storage.enableExtension
            })
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
                id: "badgePosition",
                title: "Badge position",
                contexts: ["action"]
            });
            genericBrowser.contextMenus.create({
                id: "topRight",
                checked: "topRight" === storage.badgePosition,
                type: "radio",
                parentId: "badgePosition",
                title: "Top Right",
                contexts: ["action"]
            });
            genericBrowser.contextMenus.create({
                id: "topLeft",
                checked: "topLeft" === storage.badgePosition,
                type: "radio",
                parentId: "badgePosition",
                title: "Top Left",
                contexts: ["action"]
            });
            genericBrowser.contextMenus.create({
                id: "bottomRight",
                checked: "bottomRight" === storage.badgePosition,
                type: "radio",
                parentId: "badgePosition",
                title: "Bottom Right",
                contexts: ["action"]
            });
            genericBrowser.contextMenus.create({
                id: "bottomLeft",
                checked: "bottomLeft" === storage.badgePosition,
                type: "radio",
                parentId: "badgePosition",
                title: "Bottom Left",
                contexts: ["action"]
            });
            genericBrowser.contextMenus.onClicked.addListener(function (info) {
                if (info.menuItemId === "enableExtension") {
                    genericBrowser.storage.sync.set({"enableExtension": info.checked}).then();
                } else if (info.parentMenuItemId === "timeType" && !info.wasChecked) {
                    genericBrowser.storage.sync.set({"timeType": info.menuItemId}).then();
                } else if (info.parentMenuItemId === "badgePosition" && !info.wasChecked) {
                    genericBrowser.storage.sync.set({"badgePosition": info.menuItemId}).then();
                }
            });
        })

    });
}
