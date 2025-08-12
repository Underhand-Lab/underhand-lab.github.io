import { MediaPipePoseDetector } from './pose_detector/media_pipe_pose_detector.js';
import { RawFrameMaker } from './frame_maker/raw_frame_maker.js';
import { PoseBoneFrameMaker } from './frame_maker/pose_bone_frame_maker.js';
import { Processor } from './processor.js';
import { GraphFrameMaker } from './frame_maker/graph_frame_maker.js';
import { JointAnalysisTool } from './analysis_tool/joint_analysis_tool.js';

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

// PoseFrameMaker 인스턴스
const poseFrameMaker = new PoseBoneFrameMaker();
//const poseFrameMaker = new RawFrameMaker();
const graphFrameMaker = new GraphFrameMaker();

const analysisTool = new JointAnalysisTool();

slider.max = 0;

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        // 파일이 하나 이상 선택되면 버튼 활성화
        processButton.disabled = false;
    } else {
        // 파일이 없으면 버튼 다시 비활성화
        processButton.disabled = true;
    }
});

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {
    if (!processedData) return;

    const frameIdx = parseInt(slider.value, 10);
    //currentFrameIdxSpan.textContent = frameIdx;

    poseFrameMaker.draw_img_at(frameIdx, canvasImage);
    graphFrameMaker.draw_img_at(frameIdx, canvasChart);

}

// 초기화 및 비디오 처리
processButton.addEventListener('click', async () => {

    // 버튼을 비활성화하여 중복 클릭 방지
    processButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new Processor();
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
        processedData = await processor.processVideo(fileInput.files);
        
        /*
        processedData = {
            get_landmarks_3d: () => {
                return [{
                    "R_SHOULDER": [0, 0, 1],
                    "L_SHOULDER": [1, 1, 1],
                    "R_ELBOW": [0, 2, 1]
                }]
            }
        }/**/

        graphFrameMaker.set_data(analysisTool.calc(processedData));
        // PoseFrameMaker에 데이터 설정
        /**/
        poseFrameMaker.set_data(processedData);
        // 총 프레임 수로 슬라이더와 텍스트 업데이트
        const frameCount = processedData.get_frame_cnt();
        slider.max = frameCount > 0 ? frameCount - 1 : 0;
        //totalFramesSpan.textContent = frameCount;
        /**/
        // 첫 프레임 이미지를 캔버스에 그립니다.
        updateImage();

        console.log('비디오 처리가 완료되었습니다.');
    } catch (error) {
        alert("비디오 처리 중 오류 발생")
        console.error("비디오 처리 중 오류 발생:", error);
    } finally {
        // 처리가 완료되면 버튼을 다시 활성화
        processButton.disabled = false;
    }
});

// 이벤트 리스너 설정
slider.addEventListener('input', updateImage);
console.log("main.js");

/*
const ctx = canvasChart.getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7],
        datasets: [{
                label: 'R_SHOULDER',
                data: [180, 170, 160, 162, 158, 159, 155, -172],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'L_SHOULDER',
                data: [20, 30, 40, 50, null, 32, 42, 50],
                borderColor: '#6799fa',
                borderWidth: 1
            }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});/**/