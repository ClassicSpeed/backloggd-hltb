let genericBrowser2 = chrome ? chrome : browser;
let IGDBToHLTB: Record<string, string | null> = {}
const gameCache: Record<string, HLTBGame | null> = {}
const games: Record<string, HLTBGame> = {};

const headers = {
    'Referer': 'https://howlongtobeat.com',
    'Origin': 'https://howlongtobeat.com',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'
};
refreshTimeBadges();

const mutationCallback = (mutationsList: MutationRecord[]) => {
    // Check if the main HTML element has ariaBusy set to 'true'
    const hasProgressBar = document.documentElement.ariaBusy === 'true';

    if (hasProgressBar) {
        mutationsList.forEach(({addedNodes}) => {
            Array.from(addedNodes).forEach(node => {
                if (node instanceof HTMLElement) {
                    const gameCovers = node.querySelectorAll('.game-cover');
                    if (gameCovers.length > 0) {
                        refreshTimeBadges();
                    }
                }
            });
        });
    }
};
const observer = new MutationObserver(mutationCallback);
const targetNode = document.documentElement;
const config = {childList: true, subtree: true};
observer.observe(targetNode, config);

function saveNameDictionary(record: Record<string, string | null>) {
    const jsonString = JSON.stringify(record);
    genericBrowser2.storage.sync.set({'IGDBToHLTB': jsonString}).then(() => {
        refreshTimeBadges();
    }).catch(error => {
        console.error('Error saving data:', error); // Add error handling
    });
}

function refreshTimeBadges() {
    genericBrowser2.storage.sync.get(['IGDBToHLTB']).then(result => {
        IGDBToHLTB = JSON.parse(result.IGDBToHLTB || '{}');
        deleteTimeBadges();
        addTimeBadges();
    }).catch(error => {
        console.error('Error retrieving data:', error); // Add error handling
    });
}

function deleteTimeBadges() {
    document.querySelectorAll('.time-badge').forEach(timeBadge => timeBadge.remove());
}

function getTitleName(gameCover: Element) {
    console.log(gameCover);

    let originalGameTitle = gameCover.querySelector('.overflow-wrapper')?.querySelector('.card-img')?.getAttribute("alt");
    if (originalGameTitle)
        return originalGameTitle;

    originalGameTitle = gameCover.closest('.row')?.querySelector('.col.d-block.d-md-none .game-title-section h1')?.textContent?.trim();

    return originalGameTitle;
}

function addTimeBadges() {
    genericBrowser2.storage.sync.get({
        timeType: "main",
        badgePosition: "topRight",
        enableExtension: true
    }).then(storage => {
        if (!storage.enableExtension) {
            return;
        }
        document.querySelectorAll('.game-cover').forEach((gameCover) => {
            const originalGameTitle = getTitleName(gameCover);

            if (!originalGameTitle)
                return;
            const badgeDiv = createBadge(gameCover as HTMLElement, storage.badgePosition);
            const realValue = IGDBToHLTB[originalGameTitle] || originalGameTitle;
            fetchGameData(realValue)
                .then(hltbGame => {
                    if (hltbGame) {
                        addTimeToBadge(badgeDiv, hltbGame, storage.timeType, storage.badgePosition, originalGameTitle);
                    } else {
                        showNotFoundOnBadge(badgeDiv, originalGameTitle);
                    }
                }).catch(failed => {
                console.error(`fetchGameData failed: Error: \n${failed}`);
                errorOnBadge(badgeDiv)
            });
        });
    });
}


function getNormalizedGameName(gameTitle: string) {
    return gameTitle.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z _0-9`~!@#$%^&*()-=+|\\\]}[{;:'",<.>/?]/gi, '')
        .toLowerCase()
        .split(/\s+/)
        .map(word => `"${word}"`)
        .join(",");
}

async function fetchHLTBKey(): Promise<string> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        genericBrowser2.runtime.sendMessage(
            {
                action: "fetchHLTBData",
                payload: {
                    url: 'https://howlongtobeat.com/api/search/init?t=' + Date.now(),
                    method: "GET",
                    headers,
                    body: null
                }
            },
            (response: any) => {
                if (response && response.success) {
                    resolve(response.data.token);
                } else {
                    reject(response?.error || 'Unknown error');
                }
            }
        );
    });
}

async function fetchHLTBData(gameName: string, token: string): Promise<any> {
    const url = `https://howlongtobeat.com/api/search`;
    const body = {
        searchType: "games",
        searchTerms: JSON.parse(`[${gameName}]`),
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
    }
    return new Promise((resolve, reject) => {
        // @ts-ignore
        genericBrowser2.runtime.sendMessage(
            {
                action: "fetchHLTBData",
                payload: {
                    url, method: "POST",
                    headers: {...headers, ...{"x-auth-token": token}}, body
                }
            },
            (response: any) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || 'Unknown error');
                }
            }
        );
    });
}

async function fetchGameData(rawGameTitle: string): Promise<HLTBGame | null> {
    const gameTitle = getNormalizedGameName(rawGameTitle);
    const hltbKey = await fetchHLTBKey();
    const hltbData = await fetchHLTBData(gameTitle, hltbKey);
    if (hltbData.data.length === 0)
        return null;

    games[gameTitle] = new HLTBGame({
        gameId: hltbData.data[0]?.game_id || 0,
        gameName: hltbData.data[0]?.game_name || gameTitle,
        beatTime: {
            main: {avgSeconds: hltbData.data[0]?.comp_main || 0},
            extra: {avgSeconds: hltbData.data[0]?.comp_plus || 0},
            completionist: {avgSeconds: hltbData.data[0]?.comp_100 || 0},
        },
    });


    if (!(gameTitle in gameCache)) {
        gameCache[gameTitle] = games[gameTitle] || null;
    }
    return gameCache[gameTitle];
}


function createBadge(parentElement: HTMLElement, badgePosition: string) {
    const badgeDiv = document.createElement('div');
    badgeDiv.classList.add('time-badge');
    addClassByPosition(badgePosition, badgeDiv);

    badgeDiv.title = 'Loading...'
    badgeDiv.innerText = ' - ';
    parentElement.appendChild(badgeDiv);
    return badgeDiv;
}

function addClassByPosition(badgePosition: string, badgeDiv: HTMLDivElement) {
    switch (badgePosition) {
        case "topRight":
            badgeDiv.classList.add('time-badge-top-right');
            break;
        case "topLeft":
            badgeDiv.classList.add('time-badge-top-left');
            break;
        case "bottomRight":
            badgeDiv.classList.add('time-badge-bottom-right');
            break;
        case "bottomLeft":
            badgeDiv.classList.add('time-badge-bottom-left');
            break;
    }
}

function addTimeToBadge(badgeDiv: HTMLDivElement, hltbGame: HLTBGame, timeType: string, badgePosition: string, originalGameTitle: string) {
    badgeDiv.classList.add('time-badge');
    addClassByPosition(badgePosition, badgeDiv);

    const link = document.createElement('a');
    if (hltbGame.gameId != 0) {
        link.href = 'https://howlongtobeat.com/?q=' + encodeURIComponent(hltbGame.gameName).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
        link.target = '_blank';
    }

    switch (timeType) {
        case "main":
            link.innerText = hltbGame.mainBeatTime + ' h';
            break;
        case "extra":
            link.innerText = hltbGame.extraBeatTime + ' h';
            break;
        case "completionist":
            link.innerText = hltbGame.completionistBeatTime + ' h';
            break;
    }

    badgeDiv.innerHTML = '';
    badgeDiv.appendChild(link);
    badgeDiv.title = `${hltbGame.gameName}`
        + `\n- Main Story: ${hltbGame.mainBeatTime} Hours`
        + `\n- Main + Sides: ${hltbGame.extraBeatTime} Hours`
        + `\n- Completionist: ${hltbGame.completionistBeatTime} Hours`
        + '\n\nClick the badge to open the game page on HLTB.'
        + '\nRight-click the badge to change the game title for HLTB.';

    // Add event listener for right-click
    badgeDiv.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Prevent the default context menu
        const userInput = prompt('Enter the correct game title from HLTB:');
        if (userInput) {
            IGDBToHLTB[originalGameTitle] = userInput;
            saveNameDictionary(IGDBToHLTB);
        }
    });
}

function showNotFoundOnBadge(badgeDiv: HTMLDivElement, originalGameTitle: string) {
    badgeDiv.innerText = '?';
    badgeDiv.title = 'Game not found on HowLongToBeat. ' +
        '\n- Click the question mark to enter the correct game title from HLTB.';
    badgeDiv.addEventListener('click', () => {
        const userInput = prompt('Enter the correct game title from HLTB:');
        if (userInput) {
            IGDBToHLTB[originalGameTitle] = userInput;
            saveNameDictionary(IGDBToHLTB);
        }
    });
}

function errorOnBadge(badgeDiv: HTMLDivElement) {
    badgeDiv.innerText = '⦸';
    badgeDiv.title = 'Unable to Fetch Data from HowLongToBeat-Proxy-API' +
        '\nThis usually indicates that the HowLongToBeat-Proxy-API is not working right now. This is outside the extensions control' +
        "\nPlease Try again at a (much) later time.";
}

genericBrowser2.storage.onChanged.addListener(function (changes) {
    if ("enableExtension" in changes) {
        if (changes.enableExtension.newValue) {
            addTimeBadges();
        } else {
            deleteTimeBadges();
        }
    } else if (("timeType" in changes && changes.timeType.oldValue != changes.timeType.newValue) ||
        ("badgePosition" in changes && changes.badgePosition.oldValue != changes.badgePosition.newValue)) {
        genericBrowser2.storage.sync.get({enableExtension: true}).then(storage => {
            if (storage.enableExtension) {
                refreshTimeBadges();
            }
        });
    }
});