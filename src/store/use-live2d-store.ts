
import { SpeakOptions } from '@/types/electron';
import { storageUtil } from '@/utils/storage';
import { create } from 'zustand';

type Live2DModelAudio = keyof typeof assetsAudio;
type Live2DModelExpression = keyof typeof assetsExpression;
interface Live2DStore {
    assetsAudio: typeof assetsAudio;
    assetsExpression: typeof assetsExpression;
    model?: Live2DModel;
    setModel: (model: Live2DModel) => void;
    isModelLoaded: boolean;
    setIsModelLoaded: (isLoaded: boolean) => void;
    speak: (audioPath: string, options?: SpeakOptions) => void;
    speakAssetsAudio: (audio: Live2DModelAudio) => void;
    getAudioPath: (audio: Live2DModelAudio) => string;
    setExpression: (expression: Live2DModelExpression) => void;
}

const assetsAudio = {
    hello: 'hello',
    danger: 'danger',
    analysis: 'analysis',
    rest: 'rest',
    makemoney1: [
        'makemoney_01',
        'makemoney_02',
        'makemoney_03',
        'makemoney_04',
        'makemoney_05',
    ],
    losemoney1: [
        'losemoney_01',
        'losemoney_02',
        'losemoney_03',
        'losemoney_04',
        'losemoney_05',
    ],
    angry: [
        'angry_01',
        'angry_02',
        'angry_03',
        'angry_04',
    ],
} as const

const assetsExpression = {
    tushe: '吐舌',
    whiteeyes: '白眼',
    loveeyes: '爱心眼',
}

export const useLive2DStore = create<Live2DStore>((set, get) => ({
    assetsAudio,
    assetsExpression,
    model: null,
    setModel: (model: Live2DModel) => set({ model }),
    isModelLoaded: false,
    setIsModelLoaded: (isLoaded: boolean) => set({ isModelLoaded: isLoaded }),
    speak: (audioPath, options = {}) => {

        const { model } = get();
        const { getVolume } = storageUtil()
        const volume = getVolume() != null ? getVolume() : 1

        options.volume = options.volume || Number(volume);

        if (model) {
            model.speak(audioPath, options);
        } else {
            console.error('Model not found');
        }
    },


    async speakAssetsAudio(audio: Live2DModelAudio) {
        const { getAudioPath, speak } = get();
        const audioPath = getAudioPath(audio)
        speak(audioPath)
    },

    getAudioPath: (audio: Live2DModelAudio) => {
        const { getLanguageCode } = storageUtil()
        const languageCode = getLanguageCode()
        return `assets/audio/${audio}_${languageCode}.mp3`;
    },

    setExpression: (expression: Live2DModelExpression) => {
        const { model } = get();
        if (model) {
            model.expression("吐舌");
        }
    },
}))
