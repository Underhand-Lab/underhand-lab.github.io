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

    async processVideo(videoPathList) {
        // MediaPipe 초기화
        await this.poseDetector.initialize();
        await this.videoConverter.load();
        const videoElements = await this._loadVideos(videoPathList);

        const widthList = videoElements.map(v => v.videoWidth);
        const heightList = videoElements.map(v => v.videoHeight);
        const fps = 30;

        //canvasElement.width = widthList[0];
        //canvasElement.height = heightList[0];

        const data = new ProcessedData();
        data.initialize(widthList, heightList, fps);
        
        console.log("load")
        // --- 1단계: 동영상에서 모든 프레임 이미지를 추출하여 리스트에 저장 ---
        // 이 과정이 완료되면 모든 프레임이 imageList에 담깁니다.
        const allFramesImageList = await this._getAllFramesAsImageList(videoElements);
        
        console.log("process")
        // --- 2단계: 저장된 프레임 리스트를 순회하며 포즈 처리 및 데이터 저장 ---
        let frameIndex = 0;
        for (const image of allFramesImageList) {
            const { landmarks_3d, landmarks_2d_list, visibility_score_list } =
                await this.poseDetector.process([image]);

            // 모든 프레임의 데이터를 data 객체에 저장
            data.add_data_at([image], landmarks_3d, landmarks_2d_list, visibility_score_list);

            if (this.onProgressCallback) {
                this.onProgressCallback(frameIndex + 1);
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