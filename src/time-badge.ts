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
    document.querySelectorAll('.game-cover').forEach((gameCover) => {

        const gameTitle = gameCover.querySelector('.game-text-centered')?.textContent;
        if (!gameTitle) {
            return;
        }
        chrome.runtime.sendMessage(
            "https://hltb-proxy.fly.dev/v1/query?title=" + gameTitle,
            function (response: HLTBResponse) {
                if (response.length > 0 && response[0].beatTime.main.avgSeconds > 0) {
                    addBadge(gameCover as HTMLElement, response[0]);
                }
            }
        );

    });
}

function addBadge(parentElement: HTMLElement, hltbData: HLTBData) {
    const badgeDiv = document.createElement('div');
    badgeDiv.classList.add('time-badge');
    badgeDiv.innerText = formatHours(hltbData.beatTime.main.avgSeconds / 3600) + ' h';
    badgeDiv.title = hltbData.gameName
        + '\n\nMain Story: ' + formatHours(hltbData.beatTime.main.avgSeconds / 3600) + ' Hours'
        + '\nMain + Sides: ' + formatHours(hltbData.beatTime.extra.avgSeconds / 3600) + ' Hours'
        + '\nCompletionist: ' + formatHours(hltbData.beatTime.completionist.avgSeconds / 3600) + ' Hours'
        + '\nAll Styles: ' + formatHours(hltbData.beatTime.all.avgSeconds / 3600) + ' Hours';
    parentElement.appendChild(badgeDiv);
}


function formatHours(hours: number, tolerance: number = 0.1): string {
    const roundedHours = Math.round(hours * 2) / 2;
    const decimalPart = roundedHours % 1;

    if (Math.abs(decimalPart - 0.5) < tolerance && hours < 10) {
        return `${Math.floor(roundedHours)}½`;
    } else {
        return `${Math.floor(roundedHours)}`;
    }
}


type HLTBResponse = HLTBData[];
type HLTBData = {
    gameName: string,
    beatTime: {
        main: { avgSeconds: number },
        extra: { avgSeconds: number },
        completionist: { avgSeconds: number },
        all: { avgSeconds: number }
    }
};



