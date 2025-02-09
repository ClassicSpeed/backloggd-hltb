let genericBrowser2 = chrome ? chrome : browser;
let IGDBToHLTB: Record<string, string | null> = {}
const gameCache: Record<string, HLTBGame | null> = {}
refreshTimeBadges();

const mutationCallback = (mutationsList: MutationRecord[]) => {
    mutationsList.forEach(({addedNodes}) => {
        Array.from(addedNodes).forEach(node => {
            if (node instanceof HTMLElement) {
                const gameCovers = node.querySelectorAll('.game-cover');
                const hasProgressBar = node.previousElementSibling?.classList.contains('turbolinks-progress-bar');
                if (gameCovers.length > 0 && hasProgressBar) {
                    refreshTimeBadges();
                }
            }
        });
    });
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
            const originalGameTitle = gameCover.querySelector('.overflow-wrapper')?.querySelector('.card-img')?.getAttribute("alt");
            if (!originalGameTitle) return;
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

async function fetchGameData(gameTitle: string): Promise<HLTBGame | null> {
    if (!(gameTitle in gameCache)) {
        const response = await fetch(`https://hltb-proxy.fly.dev/v1/query?title=${encodeURIComponent(gameTitle)}`);
        const data: HLTBResponse | undefined = await response.json();
        if (!data || data.length === 0 || data[0].beatTime.main.avgSeconds <= 0) {
            gameCache[gameTitle] = null;
        } else {
            gameCache[gameTitle] = new HLTBGame(data[0]);
        }
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
    link.href = 'https://howlongtobeat.com/game/' + hltbGame.gameId;
    link.target = '_blank';

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
        case "all":
            link.innerText = hltbGame.allBeatTime + ' h';
            break;
    }

    badgeDiv.innerHTML = '';
    badgeDiv.appendChild(link);
    badgeDiv.title = `${hltbGame.gameName}`
        + `\n- Main Story: ${hltbGame.mainBeatTime} Hours`
        + `\n- Main + Sides: ${hltbGame.extraBeatTime} Hours`
        + `\n- Completionist: ${hltbGame.completionistBeatTime} Hours`
        + `\n- All Styles: ${hltbGame.allBeatTime} Hours`
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