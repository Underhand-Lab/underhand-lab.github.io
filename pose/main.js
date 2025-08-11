import { MediaPipePoseDetector } from './pose_detector/media_pipe_pose_detector.js';
import { PoseFrameMaker } from './frame_maker/pose_frame_maker.js';
import { Processor } from './processor.js';

// DOM 요소 가져오기
const canvas = document.getElementById('outputCanvas');
const slider = document.getElementById('frameSlider');
const currentFrameIdxSpan = document.getElementById('currentFrameIdx');
const totalFramesSpan = document.getElementById('totalFrames');
const fileInput = document.getElementById('video-files');
const startButton = document.getElementById('process-button');

// PoseFrameMaker 인스턴스
const poseFrameMaker = new PoseFrameMaker();

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        // 파일이 하나 이상 선택되면 버튼 활성화
        startButton.disabled = false;
    } else {
        // 파일이 없으면 버튼 다시 비활성화
        startButton.disabled = true;
    }
});

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {
    return
    if (!processedData) return;

    const frameIdx = parseInt(slider.value, 10);
    //currentFrameIdxSpan.textContent = frameIdx;

    const imgMat = poseFrameMaker.get_img_at(frameIdx);
    if (imgMat) {
        cv.imshow(canvas, imgMat);
        imgMat.delete();
    }
}

// 초기화 및 비디오 처리
startButton.addEventListener('click', async () => {
    // 버튼을 비활성화하여 중복 클릭 방지
    startButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new Processor();
    const detector = new MediaPipePoseDetector();

    // 사용자가 선택한 파일의 URL을 가져옴
    const videoFile = fileInput.files[0];
    const videoPath = URL.createObjectURL(videoFile);
    
    // 비디오 처리 진행 상황을 콘솔에 출력하는 콜백
    const onProgress = (frameNumber) => {
        console.log(`Processing frame: ${frameNumber}`);
    };

    // 프로세서 설정 및 비디오 처리
    try {
        processor.setting(detector, onProgress);
        // data 변수에 모든 처리된 데이터를 저장
        processedData = await processor.processVideo([videoPath]);
        
        // PoseFrameMaker에 데이터 설정
        poseFrameMaker.set_data(
            processedData.get_raw_img_list(0),
            processedData.get_landmarks_2d_list(0),
            processedData.get_visibility_score_list(0)
        );

        // 총 프레임 수로 슬라이더와 텍스트 업데이트
        const frameCount = processedData.get_frame_cnt();
        slider.max = frameCount > 0 ? frameCount - 1 : 0;
        //totalFramesSpan.textContent = frameCount;

        // 첫 프레임 이미지를 캔버스에 그립니다.
        updateImage();

        console.log('비디오 처리가 완료되었습니다.');
    } catch (error) {
        console.error("비디오 처리 중 오류 발생:", error);
    } finally {
        // 처리가 완료되면 버튼을 다시 활성화
        startButton.disabled = false;
    }
});

// 이벤트 리스너 설정
slider.addEventListener('input', updateImage);
console.log("main.js");