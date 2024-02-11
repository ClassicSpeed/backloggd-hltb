let genericBrowser2 = chrome ? chrome : browser;
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


addTimeBadges();

function refreshTimeBadges() {
    deleteTimeBadges();
    addTimeBadges();
}

function deleteTimeBadges() {
    document.querySelectorAll('.time-badge').forEach(timeBadge => timeBadge.remove());
}

function addTimeBadges() {
    genericBrowser2.storage.sync.get({timeType: "main"}).then(storage => {
        document.querySelectorAll('.game-cover').forEach((gameCover) => {
            const gameTitle = gameCover.querySelector('.game-text-centered')?.textContent;
            if (!gameTitle) return;

            const badgeDiv = createBadge(gameCover as HTMLElement);
            fetchGameData(gameTitle)
                .then(response => {
                    if (response) {
                        addTimeToBadge(badgeDiv, response, storage.timeType);
                    } else {
                        deleteBadge(badgeDiv);
                    }
                });
        });
    });
}

async function fetchGameData(gameTitle: string): Promise<HLTBGame | undefined> {
    const response = await fetch(`https://hltb-proxy.fly.dev/v1/query?title=${gameTitle}`);
    const data: HLTBResponse | undefined = await response.json();
    if (!data || data.length === 0 || data[0].beatTime.main.avgSeconds <= 0) {
        return undefined;
    }
    return new HLTBGame(data[0]);
}


function createBadge(parentElement: HTMLElement) {
    const badgeDiv = document.createElement('div');
    badgeDiv.classList.add('time-badge');
    badgeDiv.title = 'Loading...'
    badgeDiv.innerText = ' - ';
    parentElement.appendChild(badgeDiv);
    return badgeDiv;
}

function deleteBadge(badgeDiv: HTMLDivElement) {
    badgeDiv.remove();
}

function addTimeToBadge(badgeDiv: HTMLDivElement, hltbGame: HLTBGame, timeType: string) {
    badgeDiv.classList.add('time-badge');
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
    } else if ("timeType" in changes && changes.timeType.oldValue != changes.timeType.newValue) {
        genericBrowser2.storage.sync.get({enableExtension: true}).then(storage => {
            if (storage.enableExtension) {
                refreshTimeBadges();
            }
        });
    }
});