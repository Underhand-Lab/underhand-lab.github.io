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

        /*
        const widthList = videoElements.map(v => v.videoWidth);
        const heightList = videoElements.map(v => v.videoHeight);
        const fps = 30;

        data.initialize(widthList, heightList, fps);
        */

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
        //data.initialize([720], [480], 24, images.length);

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

    async _loadVideos(videoPathList) {
        const videoPromises = videoPathList.map(path => new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = path;
            video.muted = true;
            video.autoplay = false;
            video.onloadeddata = () => resolve(video);
            video.onerror = (e) => reject(e);
        }));
        return await Promise.all(videoPromises);
    }
    
    // 이 함수가 모든 프레임을 추출하여 리스트로 반환합니다.
    async _getAllFramesAsImageList(videoElements) {
        const allImageList = [];
        const video = videoElements[0]; // 단일 비디오만 가정
        
        let frameIndex = 0;
        
        console.log(frameIndex);
        // 비디오 프레임이 준비될 때까지 기다리는 이벤트 리스너를 한 번만 설정
        if (video.readyState < 1) { // HTMLMediaElement.HAVE_NOTHING
            await new Promise(resolve => {
                video.onloadedmetadata = () => resolve();
            });
        }

        console.log(frameIndex);

        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';

        const totalFrames = Math.floor(video.duration * video.playbackRate);
        
        while (frameIndex < totalFrames) {
            video.currentTime = frameIndex / video.playbackRate;
            
            // `setTimeout`을 사용하여 브라우저가 프레임을 그릴 시간을 줍니다.
            await new Promise(resolve => setTimeout(resolve, 33)); // 약 30fps 기준

            // `currentTime`이 제대로 설정되었는지 확인
            if (video.ended || video.currentTime >= video.duration) {
                break;
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            allImageList.push(imageData);
            frameIndex++;
        }
        return allImageList;
    }
}