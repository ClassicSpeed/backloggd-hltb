let genericBrowser = chrome ? chrome : browser;


genericBrowser.storage.sync.get({enableExtension: true, timeType: "main", badgePosition: "topRight"}).then(storage => {
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


});
genericBrowser.runtime.onInstalled.addListener(function () {
    genericBrowser.contextMenus.onClicked.addListener(function (info) {
        if (info.menuItemId === "enableExtension") {
            chrome.storage.sync.set({"enableExtension": info.checked}).then();
        } else if (info.parentMenuItemId === "timeType" && !info.wasChecked) {
            chrome.storage.sync.set({"timeType": info.menuItemId}).then();
        } else if (info.parentMenuItemId === "badgePosition" && !info.wasChecked) {
            chrome.storage.sync.set({"badgePosition": info.menuItemId}).then();
        }
    });
});
