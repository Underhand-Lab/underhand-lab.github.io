// processor.js
import { ProcessedData } from './processed_data.js';
import { VideoConverter } from './video_to_img_list/ffmpeg_video_to_img_list.js'

export class Processor {
    constructor() {
        this.poseDetector = null;
        this.onProgressCallback = null;
        this.videoConverter = new VideoConverter()
    }

    setting(poseDetector, onProgress) {
        this.poseDetector = poseDetector;
        this.onProgressCallback = onProgress;
    }

    async processVideo(videoList) {
        await this.videoConverter.load();

        if (this.onProgressCallback) {
            this.onProgressCallback.onState("준비 중");
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        const videoMetaData = this.videoConverter.getVideoMetadata(videoList[0]);
        const imgBlobList =
            await this.videoConverter.convert(videoList[0]);

        const data = new ProcessedData();

        const images = [];

        for (const blob of imgBlobList) {
            const url = URL.createObjectURL(blob);
            const img = new Image();

            img.src = url;
            await new Promise(resolve => img.onload = resolve);
            images.push(img);

        }

        // 모든 작업이 끝난 후 URL 해제
        imgBlobList.forEach(blob => {
            const url = URL.createObjectURL(blob);
            URL.revokeObjectURL(url);
        });
        
        // MediaPipe 초기화
        await this.poseDetector.initialize();

        // --- 2단계: 저장된 프레임 리스트를 순회하며 포즈 처리 및 데이터 저장 ---
        console.log(images.length);
        data.initialize([videoMetaData.width], [videoMetaData.height], videoMetaData.fps, images.length);

        if (this.onProgressCallback) {
            this.onProgressCallback.onState("처리 중");
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        console.log("process")
        let frameIndex = 0;

        for (const image of images) {
            const { landmarks_3d, landmarks_2d_list, visibility_score_list } =
                await this.poseDetector.process([image]);

            // 모든 프레임의 데이터를 data 객체에 저장
            data.add_data_at([image], landmarks_3d, landmarks_2d_list, visibility_score_list);

            if (this.onProgressCallback) {
                this.onProgressCallback.onProgress(frameIndex + 1, images.length);
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            frameIndex++;
        }

        return data; // 모든 데이터가 저장된 data 객체를 반환
    }
    
}