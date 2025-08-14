import { MediaPipePoseDetector } from './pose_detector/media_pipe_pose_detector.js';
import { RawFrameMaker } from './frame_maker/raw_frame_maker.js';
import { PoseBoneFrameMaker } from './frame_maker/pose_bone_frame_maker.js';
import { PoseProcessor } from './pose_processor.js';
import { GraphFrameMaker } from './frame_maker/graph_frame_maker.js';
import { AngleAnalysisTool } from './analysis_tool/angle_analysis_tool.js';
import { HeightAnalysisTool } from './analysis_tool/height_analysis_tool.js';
import { VelocityAnalysisTool } from './analysis_tool/velocity_analysis_tool.js';

// DOM 요소 가져오기
const canvasImage = document.getElementById('outputImage');
const canvasChart = document.getElementById('outputChart');
const slider = document.getElementById('frameSlider');
const currentFrameIdxSpan = document.getElementById('currentFrameIdx');
const totalFramesSpan = document.getElementById('totalFrames');
const fileInput = document.getElementById('video-files');
const processButton = document.getElementById('process-button');
const statusMessage = document.getElementById('status-message');
const progressBar = document.getElementById('progress-bar');
const analysisSelect = document.getElementById('analysis');

// PoseFrameMaker 인스턴스
const poseFrameMaker = new PoseBoneFrameMaker();
//const poseFrameMaker = new RawFrameMaker();
const graphFrameMaker = new GraphFrameMaker();

const analysisTool = {
    "joint": new AngleAnalysisTool(),
    "velocity": new VelocityAnalysisTool(),
    "height": new HeightAnalysisTool(),
}

slider.max = 0;

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {
    if (!processedData) return;

    const frameIdx = parseInt(slider.value, 10);
    //currentFrameIdxSpan.textContent = frameIdx;

    poseFrameMaker.draw_img_at(frameIdx, canvasImage);
    graphFrameMaker.draw_img_at(frameIdx, canvasChart);

}

function set_data(data) {

    if (data == null) return;

    processedData = data;

    graphFrameMaker.set_data(
        analysisTool[analysisSelect.value].calc(processedData));
    poseFrameMaker.set_data(processedData);

    const frameCount = processedData.get_frame_cnt();
    slider.max = frameCount > 0 ? frameCount - 1 : 0;

    updateImage();

}

// 초기화 및 비디오 처리
processButton.addEventListener('click', async () => {

    // 버튼을 비활성화하여 중복 클릭 방지
    processButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new PoseProcessor();
    const detector = new MediaPipePoseDetector();

    // 프로세서 설정 및 비디오 처리
    try {
        processor.setting(detector, {
            onState: (state) => {
                statusMessage.textContent = state;
            },
            onProgress: (current, total) => {
                const percentage = (current / total) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        });

        // data 변수에 모든 처리된 데이터를 저장
        const ret = await processor.processVideo(fileInput.files);
        
        set_data(ret);
        console.log('비디오 처리가 완료되었습니다.');

    } catch (error) {

        alert("비디오 처리 중 오류 발생")
        console.error("비디오 처리 중 오류 발생:", error);

    } finally {
        // 처리가 완료되면 버튼을 다시 활성화
        processButton.disabled = false;
    }

});

fileInput.addEventListener('change', () => {
    processButton.disabled = fileInput.files.length < 1;
});

analysisSelect.addEventListener('change', () => {
    set_data(processedData);
});

slider.addEventListener('input', updateImage);