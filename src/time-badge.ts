function addBadge(parentElement: HTMLElement, hours: number) {
    const badgeDiv = document.createElement('div');
    badgeDiv.classList.add('time-badge');
    badgeDiv.innerText = formatHours(hours);
    parentElement.appendChild(badgeDiv);
}


function formatHours(hours: number, tolerance: number = 0.1): string {
    const roundedHours = Math.round(hours * 2) / 2;
    const decimalPart = roundedHours % 1;

    if (Math.abs(decimalPart - 0.5) < tolerance && hours < 10) {
        return `${Math.floor(roundedHours)}½ h`;
    } else {
        return `${Math.floor(roundedHours)} h`;
    }
}

type HLTBResponse = { gameName: string, beatTime: { main: { avgSeconds: number } } }[];

document.querySelectorAll('.game-cover').forEach((gameCover) => {

    const gameTitle = gameCover.querySelector('.game-text-centered')?.textContent;
    if (!gameTitle) {
        return;
    }
    chrome.runtime.sendMessage( //goes to bg_page.js
        "https://hltb-proxy.fly.dev/v1/query?title=" + gameTitle,
        function (response: HLTBResponse) {
            if (response.length > 0 && response[0].beatTime.main.avgSeconds > 0) {
                addBadge(gameCover as HTMLElement, response[0].beatTime.main.avgSeconds / 3600);
            }
        }
    );

});