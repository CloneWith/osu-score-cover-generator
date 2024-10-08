export default interface CoverData {
    user: {
        id: number
        userName: string
        code: string
        globalRank: number
        countryRank: number
    }
    score: {
        pp: number
        status: {
            type: 'ss' | 'fc' | 'fail' | 'miss' | 'sb'
            value: number
        }
        rank: number
        accuracy: number
        maxCombo: {
            value: number
            perfect: boolean
        }
    }
    beatmap: {
        id: number
        title: string
        artist: string
        creator: string
        mode: 'osu' | 'taiko' | 'fruits' | 'mania'
        status: 'ranked' | 'approved' | 'loved' | 'unranked'
        stats: Record<'time' | 'bpm' | 'ar' | 'cs' | 'od' | 'hp', string | number>
        difficulty: {
            star: number
            name: string
        }
        mods: Record<'ez' | 'nf' | 'ht' | 'hd' | 'hr' | 'dt' | 'nc' | 'fl' | 'sd' | 'pf' | 'rx' | 'ap' | 'so' | 'v2', { enabled: boolean }>
    }
    comment: string
}