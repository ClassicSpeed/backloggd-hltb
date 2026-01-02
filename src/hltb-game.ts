type HLTBResponse = HLTBData[];
type HLTBData = {
    gameName: string,
    gameId: number,
    beatTime: {
        main: { avgSeconds: number },
        extra: { avgSeconds: number },
        completionist: { avgSeconds: number },
        all: { avgSeconds: number }
    }
};

class HLTBGame {
    constructor(private data: HLTBData) {
        this.data = data;
    }

    get gameName(): string {
        return this.data.gameName;
    }

    get gameId(): number {
        return this.data.gameId;
    }

    get mainBeatTime(): string {
        return formatHours(this.data.beatTime.main.avgSeconds / 3600);
    }

    get extraBeatTime(): string {
        return formatHours(this.data.beatTime.extra.avgSeconds / 3600);
    }

    get completionistBeatTime(): string {
        return formatHours(this.data.beatTime.completionist.avgSeconds / 3600);
    }

    get allBeatTime(): string {
        return formatHours(this.data.beatTime.all.avgSeconds / 3600);
    }
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

