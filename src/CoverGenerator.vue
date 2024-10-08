<script setup lang="ts">
import { reactive, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import CoverData from './cover/CoverData'
import CoverAssets from './cover/CoverAssets'
import RenderOptions from './cover/RenderOptions'
import CoverRender from './cover/CoverRender'
import initAssets from './cover/utils/initAssets'
import flagIcon from './cover/utils/flagIcon'
import fileName from './cover/utils/fileName'
import exportCover from './cover/utils/exportCover'
import loadUserData from './cover/utils/loadUserData'
import loadBeatmapData from './cover/utils/loadBeatmapData'
import loadImgFile from './utils/loadImgFile'
import loadImgUrl from './utils/loadImgUrl'
import Flex from './components/Flex.vue'
import Collapsible from './components/Collapsible.vue'
import PropTitle from './components/PropTitle.vue'
import Button from './components/Button.vue'
import Switch from './components/Switch.vue'
import TextInput from './components/TextInput.vue'
import TextArea from './components/TextArea.vue'
import DragDrop from './components/DragDrop.vue'
import Dropdown from './components/Dropdown.vue'
import ModSelect from './components/ModSelect.vue'
import countryList from './assets/countries.json'

// i18n
const { t } = useI18n()
// Dropdown Options
const dropDownOptions = {
    countryCode: [
        {
            name: t('dropDown.countryCode.none'),
            value: ""
        }
    ],
    scoreStatus: [
        {
            name: 'SS',
            value: 'ss'
        },
        {
            name: t('dropDown.scoreStatus.fc'),
            value: 'fc'
        },
        {
            name: t('dropDown.scoreStatus.fail'),
            value: 'fail'
        },
        {
            name: t('dropDown.scoreStatus.miss'),
            value: 'miss'
        },
        {
            name: t('dropDown.scoreStatus.sb'),
            value: 'sb'
        },
    ],
    beatmapStatus: [
        {
            name: t('dropDown.beatmapStatus.ranked'),
            value: 'ranked'
        },
        {
            name: t('dropDown.beatmapStatus.approved'),
            value: 'approved'
        },
        {
            name: t('dropDown.beatmapStatus.loved'),
            value: 'loved'
        },
        {
            name: t('dropDown.beatmapStatus.unranked'),
            value: 'unranked'
        }
    ],
    aspectRatio: [
        {
            name: '16:9',
            value: '16by9'
        },
        {
            name: '16:10',
            value: '16by10'
        },
        {
            name: '4:3',
            value: '4by3'
        }
    ],
    exportType: [
        {
            name: 'png',
            value: 'png'
        },
        {
            name: 'jpg',
            value: 'jpeg'
        },
        {
            name: 'webp',
            value: 'webp'
        }
    ]
}
countryList.forEach((item) => {
    const newOption = {
        name: item.name,
        value: item.code
    }
    dropDownOptions.countryCode.push(newOption)
})
// Cover
const coverData: CoverData = reactive({
    user: {
        id: 0,
        userName: 'player',
        code: '',
        globalRank: 0,
        countryRank: 0
    },
    score: {
        pp: 0,
        status: {
            type: 'fc',
            value: 0
        },
        rank: 0,
        accuracy: 0,
        maxCombo: {
            value: 0,
            perfect: false
        },
    },
    beatmap: {
        id: 0,
        title: 'Song Title',
        artist: 'Artist',
        creator: 'Mapper',
        mode: 'osu',
        status: 'ranked',
        stats: {
            time: '0:00',
            bpm: 0,
            ar: 0,
            cs: 0,
            od: 0,
            hp: 0
        },
        difficulty: {
            star: 0,
            name: 'Easy'
        },
        mods: {
            ez: {
                enabled: false
            },
            nf: {
                enabled: false
            },
            ht: {
                enabled: false
            },
            hd: {
                enabled: false
            },
            hr: {
                enabled: false
            },
            dt: {
                enabled: false
            },
            nc: {
                enabled: false
            },
            fl: {
                enabled: false
            },
            sd: {
                enabled: false
            },
            pf: {
                enabled: false
            },
            rx: {
                enabled: false
            },
            ap:
            {
                enabled: false
            },
            so: {
                enabled: false
            },
            v2: {
                enabled: false
            }
        }
    },
    comment: 'Comment'
})
const coverAssets: CoverAssets = reactive({
    user: {
        avatar: new Image(),
        flag: new Image(),
        defaults: {
            avatar: new Image(),
            flag: new Image()
        }
    },
    beatmap: {
        background: new Image(),
        statusIcons: {
            ranked: new Image(),
            approved: new Image(),
            loved: new Image(),
            unranked: new Image()
        },
        defaults: {
            background: new Image()
        }
    }
})
const coverOptions: { render: RenderOptions, exportType: string } = reactive({
    render: {
        ratio: '16by10',
        scale: '1',
        show: {
            pp: true,
            rank: true,
            beatmapStats: {
                time: false,
                bpm: false,
                ar: true,
                cs: true,
                od: false,
                hp: false
            }
        }
    },
    exportType: 'png'
})
const coverPreview = new CoverRender()
// Cover methods
const setAvatar = async (file: File) => {
    coverAssets.user.avatar = await loadImgFile(file)
}
const setBackground = async (file: File) => {
    coverAssets.beatmap.background = await loadImgFile(file)
}
const downloadCover = async () => {
    const data = coverData
    const assets = coverAssets
    const options = coverOptions
    try {
        const blob = await exportCover(data, assets, options.render, options.exportType)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName(data, options.render, options.exportType)
        a.click()
        URL.revokeObjectURL(url)
    } catch (err) {
        console.log(`Download failed! ${err}`)
    }
}
const copyCover = async () => {
    const data = coverData
    const assets = coverAssets
    const options = coverOptions
    try {
        const blob = await exportCover(data, assets, options.render, 'png')
        const cp = [new ClipboardItem({ [blob.type]: blob })]
        navigator.clipboard.write(cp)
    } catch (err) {
        console.log(`Copy failed! ${err}`)
    }
}
// Data fetching
const dataFetchingArgs = reactive({
    user: {
        id: 0
    },
    beatmap: {
        id: 0,
        unicode: false
    }
})
const setUserData = async () => {
    const newData = await loadUserData(dataFetchingArgs.user.id)
    if (newData) {
        Object.assign(coverData.user, newData.user)
        coverAssets.user.avatar = await loadImgUrl(newData.avatarUrl)
        coverData.user.id = dataFetchingArgs.user.id
    }
}
const setBeatmapData = async () => {
    const newData = await loadBeatmapData(dataFetchingArgs.beatmap.id, coverData.beatmap.mods, dataFetchingArgs.beatmap.unicode)
    if (newData) {
        Object.assign(coverData.beatmap, newData.beatmap)
        coverAssets.beatmap.background = await loadImgUrl(newData.backgroundUrl)
        coverData.beatmap.id = dataFetchingArgs.beatmap.id
    }
}
// vue methods
onMounted(async () => {
    const previewCv = coverPreview.canvas
    previewCv.style.width = '100%'
    previewCv.style.height = '100%'
    const previewDiv = document.getElementById("cover-preview") as HTMLDivElement
    previewDiv.append(previewCv)
    await initAssets(coverAssets)
    coverPreview.draw(coverData, coverAssets)
})
watchEffect(async () => coverAssets.user.flag = await flagIcon(coverData.user.code))
watchEffect(() => {
    // refersh preview when any option changes
    const previewOptions = coverPreview.renderOptions
    previewOptions.ratio = coverOptions.render.ratio
    previewOptions.show = coverOptions.render.show
    coverPreview.draw(coverData, coverAssets)
})
watchEffect(
    // refresh beatmap star and stats when mod changes
    async () => {
        const newData = await loadBeatmapData(coverData.beatmap.id, coverData.beatmap.mods, false)
        if (newData) {
            Object.assign(coverData.beatmap.stats, newData.beatmap.stats)
            coverData.beatmap.difficulty.star = newData.beatmap.difficulty!.star
        }
    }
)
</script>
<template>
    <div class="cover-generator">
        <div class="cover-preview" id="cover-preview"></div>
        <div class="cover-settings">
            <div class="cover-settings-half">
                <Collapsible :title="t('collapsibleHeader.dataFetching')" id="cover-settings-data-fetching">
                    <Flex :column="true" gap=".75rem">
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.userId') }}</PropTitle>
                            <Flex>
                                <TextInput :number="true" placeholder="0" v-model:value="dataFetchingArgs.user.id">
                                </TextInput>
                                <Button @click="setUserData">{{ t('button.ok') }}</Button>
                            </Flex>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex width="fit-content" :column="true">
                                <PropTitle>Unicode</PropTitle>
                                <Switch size="large" v-model:checked="dataFetchingArgs.beatmap.unicode"></Switch>
                            </Flex>
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.beatmapId') }}</PropTitle>
                                <Flex>
                                    <TextInput :number="true" placeholder="0"
                                        v-model:value="dataFetchingArgs.beatmap.id">
                                    </TextInput>
                                    <Button @click="setBeatmapData">{{ t('button.ok') }}</Button>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </Collapsible>
                <Collapsible :title="t('collapsibleHeader.player')" id="cover-settings-user">
                    <Flex gap=".75rem">
                        <Flex width="fit-content" :column="true">
                            <PropTitle>{{ t('propTitle.userAvatar') }}</PropTitle>
                            <DragDrop width="6.375rem" height="6.375rem" @change="setAvatar"></DragDrop>
                        </Flex>
                        <Flex :column="true" gap=".75rem">
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.userName') }}</PropTitle>
                                <TextInput placeholder="alivemaster" v-model:value="coverData.user.userName">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.userFlag') }}</PropTitle>
                                <Dropdown :options="dropDownOptions.countryCode" v-model:selected="coverData.user.code">
                                </Dropdown>
                            </Flex>
                        </Flex>
                    </Flex>
                </Collapsible>
                <Collapsible :title="t('collapsibleHeader.score')" id="cover-settings-score">
                    <Flex :column="true" gap=".75rem">
                        <Flex :column="true">
                            <Flex gap="auto">
                                <PropTitle>PP</PropTitle>
                                <Switch v-model:checked="coverOptions.render.show.pp"></Switch>
                            </Flex>
                            <TextInput :enabled="coverOptions.render.show.pp" :number="true" placeholder="0"
                                v-model:value="coverData.score.pp">
                            </TextInput>
                        </Flex>
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.scoreStatus') }}</PropTitle>
                            <Flex>
                                <Dropdown :options="dropDownOptions.scoreStatus"
                                    v-model:selected="coverData.score.status.type">
                                </Dropdown>
                                <TextInput
                                    :enabled="coverData.score.status.type === 'miss' || coverData.score.status.type === 'sb'"
                                    :number="true" placeholder="0" v-model:value="coverData.score.status.value">
                                </TextInput>
                            </Flex>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>{{ t('propTitle.scoreRank') }}</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.rank"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.rank" :number="true" placeholder="0"
                                    v-model:value="coverData.score.rank">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.scoreAccuracy') }}</PropTitle>
                                <TextInput :number="true" placeholder="0" v-model:value="coverData.score.accuracy">
                                </TextInput>
                            </Flex>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex width="fit-content" :column="true">
                                <PropTitle>{{ t('propTitle.scorePerfect') }}</PropTitle>
                                <Switch size="large" v-model:checked="coverData.score.maxCombo.perfect"></Switch>
                            </Flex>
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.scoreMaxCombo') }}</PropTitle>
                                <TextInput :number="true" placeholder="0"
                                    v-model:value="coverData.score.maxCombo.value">
                                </TextInput>
                            </Flex>
                        </Flex>
                    </Flex>
                </Collapsible>
                <Collapsible :title="t('collapsibleHeader.beatmap')" id="cover-settings-beatmap">
                    <Flex :column="true" gap=".75rem">
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.beatmapTitle') }}</PropTitle>
                            <TextInput placeholder="No Title" v-model:value="coverData.beatmap.title">
                            </TextInput>
                        </Flex>
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.beatmapBg') }}</PropTitle>
                            <DragDrop width="100%" @change="setBackground"></DragDrop>
                        </Flex>
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.beatmapStatus') }}</PropTitle>
                            <Dropdown :options="dropDownOptions.beatmapStatus"
                                v-model:selected="coverData.beatmap.status">
                            </Dropdown>
                        </Flex>
                    </Flex>
                </Collapsible>
            </div>
            <div class="cover-settings-half">
                <Collapsible :title="t('collapsibleHeader.difficulty')" id="cover-settings-difficulty">
                    <Flex :column="true" gap=".75rem">
                        <Flex gap=".75rem">
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>{{ t('propTitle.beatmapTime') }}</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.time"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.time" placeholder="00:00"
                                    v-model:value="coverData.beatmap.stats.time">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>BPM</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.bpm"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.bpm" :number="true"
                                    placeholder="0" v-model:value="coverData.beatmap.stats.bpm">
                                </TextInput>
                            </Flex>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>AR</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.ar"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.ar" :number="true"
                                    placeholder="0" v-model:value="coverData.beatmap.stats.ar">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>CS</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.cs"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.cs" :number="true"
                                    placeholder="0" v-model:value="coverData.beatmap.stats.cs">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>OD</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.od"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.od" :number="true"
                                    placeholder="0" v-model:value="coverData.beatmap.stats.od">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <Flex gap="auto">
                                    <PropTitle>HP</PropTitle>
                                    <Switch v-model:checked="coverOptions.render.show.beatmapStats.hp"></Switch>
                                </Flex>
                                <TextInput :enabled="coverOptions.render.show.beatmapStats.hp" :number="true"
                                    placeholder="0" v-model:value="coverData.beatmap.stats.hp">
                                </TextInput>
                            </Flex>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.beatmapStar') }}</PropTitle>
                                <TextInput :number="true" v-model:value="coverData.beatmap.difficulty.star"
                                    placeholder="0">
                                </TextInput>
                            </Flex>
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.beatmapDiffName') }}</PropTitle>
                                <TextInput v-model:value="coverData.beatmap.difficulty.name" placeholder="Easy">
                                </TextInput>
                            </Flex>
                        </Flex>
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.beatmapMods') }}</PropTitle>
                            <Flex :wrap="true">
                                <ModSelect v-for="(item, key) in coverData.beatmap.mods" :type="key" :key="key"
                                    v-model:checked="item.enabled">
                                </ModSelect>
                            </Flex>
                        </Flex>
                    </Flex>
                </Collapsible>
                <Collapsible :title="t('collapsibleHeader.comment')" id="cover-settings-comment">
                    <TextArea v-model:value="coverData.comment" placeholder="WYSI"></TextArea>
                </Collapsible>
                <Collapsible :title="t('collapsibleHeader.export')" id="cover-settings-export">
                    <Flex :column="true" gap=".75rem">
                        <Flex :column="true">
                            <PropTitle>{{ t('propTitle.aspectRatio') }}</PropTitle>
                            <Dropdown :options="dropDownOptions.aspectRatio"
                                v-model:selected="coverOptions.render.ratio">
                            </Dropdown>
                        </Flex>
                        <Flex gap=".75rem">
                            <Flex :column="true">
                                <PropTitle>{{ t('propTitle.exportScale') }}</PropTitle>
                                <TextInput :number="true" v-model:value="coverOptions.render.scale" placeholder="1">
                                </TextInput>
                            </Flex>
                            <Flex :column="true" width="fit-content">
                                <PropTitle>{{ t('propTitle.exportType') }}</PropTitle>
                                <Dropdown :options="dropDownOptions.exportType"
                                    v-model:selected="coverOptions.exportType">
                                </Dropdown>
                            </Flex>
                        </Flex>
                        <Flex>
                            <Button @click="downloadCover">{{ t('button.download') }}</Button>
                            <Button @click="copyCover">{{ t('button.copy') }}</Button>
                        </Flex>
                    </Flex>
                </Collapsible>
            </div>
        </div>
    </div>
</template>
<style scoped>
.cover-generator {
    /* box */
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 0 1rem;
}

.cover-preview {
    /* box */
    display: flex;
    width: 100%;
    height: fit-content;

    /* visual */
    overflow: hidden;
    border-radius: 1.5rem;
}

.cover-settings {
    /* box */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 1rem;
    width: 27rem;
    height: fit-content;
}

.cover-settings-half {
    /* box */
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: fit-content;
}

@media screen and (width < 1080px) {
    .cover-generator {
        /* box */
        flex-direction: column;
        margin: 0;
    }

    .cover-preview {
        /* visual */
        border-radius: 0;
    }


    .cover-settings {
        /* box */
        width: 100%;
        padding: 0 .25rem;
    }
}

@media screen and (720px < width < 1080px) {
    .cover-settings {
        /* box */
        flex-direction: row;
    }
}
</style>