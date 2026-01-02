let genericBrowser = chrome ? chrome : browser;

const headers: any = {
    'Referer': 'https://howlongtobeat.com',
    'Origin': 'https://howlongtobeat.com',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'
};
let hltbKey: string | null = null;
let fetchingHltbKey: Promise<void> | null = null;

async function fetchHltbKey(): Promise<void> {
    if (hltbKey) {
        // Token already fetched
        return;
    }

    if (!fetchingHltbKey) {
        fetchingHltbKey = (async () => {
            const tokenResponse = await fetch(`https://howlongtobeat.com/api/search/init?t=${Date.now()}`, {
                method: "GET",
                headers,
            });
            if (!tokenResponse.ok) {
                fetchingHltbKey = null; // Reset fetching state on failure
                throw new Error(`HTTP error! Status: ${tokenResponse.status} when fetching HLTB key`);
            }
            const data = await tokenResponse.json();
            hltbKey = data.token;
            // Clear fetching state after success
            fetchingHltbKey = null;
        })();
    }
// Wait for the ongoing fetch to complete
    return fetchingHltbKey;
}


genericBrowser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            // Fetch token if not already available
            await fetchHltbKey();

            // Prepare request body
            const body = {
                searchType: "games",
                searchTerms: JSON.parse(`[${message.payload}]`),
                searchPage: 1,
                size: 20,
                searchOptions: {
                    games: {
                        userId: 0,
                        platform: "",
                        sortCategory: "popular",
                        rangeCategory: "main",
                        rangeTime: {min: null, max: null},
                        gameplay: {perspective: "", flow: "", genre: "", difficulty: ""},
                        rangeYear: {min: "", max: ""},
                        modifier: ""
                    },
                    users: {sortCategory: "postcount"},
                    lists: {sortCategory: "follows"},
                    filter: "",
                    sort: 0,
                    randomizer: 0
                },
                useCache: true
            };

            // Fetch game data
            const response = await fetch(`https://howlongtobeat.com/api/search`, {
                method: "POST",
                headers: {...headers, "x-auth-token": hltbKey},
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Failed to fetch game data: ${response.status}`);
            sendResponse({ success: true, data: await response.json() });
        } catch (error: any) {
            sendResponse({success: false, error: error.message});
        }
    })();

    return true;

});

genericBrowser.runtime.onInstalled.addListener(() => {

    const rules: any = [
        {
            "id": 1,
            "priority": 1,
            "action": {
                "type": "modifyHeaders",
                "requestHeaders": [
                    {"header": "Referer", "operation": "set", "value": "https://howlongtobeat.com"},
                    {"header": "Origin", "operation": "set", "value": "https://howlongtobeat.com"}
                ]
            },
            "condition": {
                "urlFilter": "||howlongtobeat.com/*",
                "resourceTypes": ["xmlhttprequest", "main_frame", "sub_frame"]
            }
        }
    ]
    genericBrowser.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
        removeRuleIds: rules.map((rule: any) => rule.id),
    });
});

genericBrowser.runtime.onInstalled.addListener(generateMenu);
genericBrowser.runtime.onStartup.addListener(generateMenu);

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
