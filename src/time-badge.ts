function addBadge(parentElement: HTMLElement, hours: number) {
    const badgeDiv = document.createElement('div');
    badgeDiv.classList.add('time-badge');
    badgeDiv.innerText = hours.toFixed(0) + ' h'; //

    parentElement.appendChild(badgeDiv);
}

type HLTBResponse = { gameName: string, beatTime: { main: { avgSeconds: number } } }[];

document.querySelectorAll('.game-cover').forEach((element) => {

    const gameTextCenteredElement = element.querySelector('.game-text-centered');
    if (gameTextCenteredElement) {
        const textContent = gameTextCenteredElement.textContent;
        if (textContent) {
            chrome.runtime.sendMessage( //goes to bg_page.js
                "https://hltb-proxy.fly.dev/v1/query?title=" + textContent,
                function (data: HLTBResponse) {
                    if (data.length > 0 && data[0].beatTime.main.avgSeconds > 0) {
                        addBadge(element as HTMLElement, data[0].beatTime.main.avgSeconds / 3600);
                    }
                }
            );
        }
    }
});