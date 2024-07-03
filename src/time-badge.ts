let genericBrowser2 = chrome ? chrome : browser;
const gameCache: Record<string, HLTBGame | null> = {}
addTimeBadges();

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


function refreshTimeBadges() {
    deleteTimeBadges();
    addTimeBadges();
}

function deleteTimeBadges() {
    document.querySelectorAll('.time-badge').forEach(timeBadge => timeBadge.remove());
}

function addTimeBadges() {
    genericBrowser2.storage.sync.get({timeType: "main", badgePosition: "topRight"}).then(storage => {
        document.querySelectorAll('.game-cover').forEach((gameCover) => {
            const gameTitle = gameCover.querySelector('.overflow-wrapper')?.querySelector('.card-img')?.getAttribute("alt");
            if (!gameTitle) return;

            const badgeDiv = createBadge(gameCover as HTMLElement, storage.badgePosition);
            fetchGameData(gameTitle)
                .then(response => {
                    if (response) {
                        addTimeToBadge(badgeDiv, response, storage.timeType, storage.badgePosition);
                    } else {
                        deleteBadge(badgeDiv);
                    }
                });
        });
    });
}

async function fetchGameData(gameTitle: string): Promise<HLTBGame | null> {
    if (!(gameTitle in gameCache)) {
        const response = await fetch(`https://hltb-proxy.fly.dev/v1/query?title=${gameTitle}`);
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

function deleteBadge(badgeDiv: HTMLDivElement) {
    badgeDiv.remove();
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

function addTimeToBadge(badgeDiv: HTMLDivElement, hltbGame: HLTBGame, timeType: string, badgePosition: string) {
    badgeDiv.classList.add('time-badge');
    addClassByPosition(badgePosition, badgeDiv);

    switch (timeType) {
        case "main":
            badgeDiv.innerText = hltbGame.mainBeatTime + ' h';
            break;
        case "extra":
            badgeDiv.innerText = hltbGame.extraBeatTime + ' h';
            break;
        case "completionist":
            badgeDiv.innerText = hltbGame.completionistBeatTime + ' h';
            break;
        case "all":
            badgeDiv.innerText = hltbGame.allBeatTime + ' h';
            break;

    }
    badgeDiv.title = `${hltbGame.gameName}`
        + `\n- Main Story: ${hltbGame.mainBeatTime} Hours`
        + `\n- Main + Sides: ${hltbGame.extraBeatTime} Hours`
        + `\n- Completionist: ${hltbGame.completionistBeatTime} Hours`
        + `\n- All Styles: ${hltbGame.allBeatTime} Hours`;
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