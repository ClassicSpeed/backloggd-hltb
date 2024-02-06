chrome.runtime.onMessage.addListener(function (request) {
    if (request.message === 'TabUpdated') {
        setTimeout(checkAndAddTimeBadges, 500);
    }
})

//Temporal workaround to know when the page finished loading
let attempts = 0;

function checkAndAddTimeBadges() {
    const progressBar = document.querySelector('.turbolinks-progress-bar');
    if (progressBar && attempts < 10) {
        attempts++;
        setTimeout(checkAndAddTimeBadges, 500);
    } else if (!progressBar) {
        addTimeBadges();
    } else {
        console.error("The Page didn't load in time...");
    }
}


function addTimeBadges() {
    chrome.storage.sync.get({timeType: "main"}, storage => {
        document.querySelectorAll('.game-cover').forEach((gameCover) => {
            const gameTitle = gameCover.querySelector('.game-text-centered')?.textContent;
            if (!gameTitle) {
                return;
            }
            chrome.runtime.sendMessage(
                "https://hltb-proxy.fly.dev/v1/query?title=" + gameTitle,
                function (response: HLTBResponse) {
                    if (response.length > 0 && response[0].beatTime.main.avgSeconds > 0) {
                        addBadge(gameCover as HTMLElement, new HLTBGame(response[0]), storage.timeType);
                    }
                }
            );

        });
    });
}

function addBadge(parentElement: HTMLElement, hltbGame: HLTBGame, timeType: string) {
    const badgeDiv = document.createElement('div');
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
    parentElement.appendChild(badgeDiv);
}

