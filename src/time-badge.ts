let genericBrowser2 = chrome ? chrome : browser;
const mutationCallback = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            for (const node of addedNodes) {
                if (node instanceof HTMLElement) {
                    const gameCovers = node.querySelectorAll('.game-cover');
                    if (gameCovers.length > 0 && mutation.previousSibling instanceof HTMLElement && mutation.previousSibling.classList.contains('turbolinks-progress-bar')) {
                        refreshTimeBadges();
                    }
                }
            }
        }
    }
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
            if (!gameTitle) {
                return;
            }

            const timeBadge = createBadge(gameCover as HTMLElement);
            fetch("https://hltb-proxy.fly.dev/v1/query?title=" + gameTitle).then(response => response.json()).then(
                function (response: HLTBResponse) {
                    if (response.length > 0 && response[0].beatTime.main.avgSeconds > 0) {
                        addTimeToBadge(timeBadge as HTMLDivElement, new HLTBGame(response[0]), storage.timeType);
                    } else {
                        deleteBadge(timeBadge);
                    }
                });

        });
    });
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