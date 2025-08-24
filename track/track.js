import { TrackProcessor } from '/src/track/track_processor.js';
import * as BallDetector from '/src/track/ball_detector/index.js';
import * as TrackFrameMaker from '/src/track/frame_maker/track_frame_maker.js';
import * as Calc from '/src/track/calc/velocity.js';

// DOM 요소 가져오기
const canvasImage = document.getElementById('outputImage');
const dataText = document.getElementById('dataText');
const slider = document.getElementById('frameSlider');

const fileInput = document.getElementById('video-files');
const processButton = document.getElementById('process-button');
const statusMessage = document.getElementById('status-message');
const progressBar = document.getElementById('progress-bar');
const confInput = document.getElementById('confInput');

slider.max = 0;

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;
const detector = new BallDetector.YOLO11BallDetector();
const frame_maker = new TrackFrameMaker.TrackFrameMaker();

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {
    if (!processedData) return;

    frame_maker.setConf(confInput.value);

    const frameIdx = parseInt(slider.value, 10);
    //currentFrameIdxSpan.textContent = frameIdx;

    frame_maker.draw_img_at(frameIdx, canvasImage);

    let velocity = null;
    let angle = null;

    if (frameIdx > 0) {

        velocity = Calc.calcVelocity(
            processedData["ballData"][frameIdx - 1],
            processedData["ballData"][frameIdx],
            processedData["metaData"]["fps"], confInput.value);

        angle = Calc.calcAngle(
            processedData["ballData"][frameIdx - 1],
            processedData["ballData"][frameIdx], confInput.value);

    }
    let htmlContent = `
    <table>
        <thead>
        <tr>
            <th>속도</th>
            <th>각도</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>${velocity != null ? velocity.toFixed(2) : "?"} km/h</td>
            <td>${angle != null ? angle.toFixed(2) : "?"} 도</td>
        </tr>
        </tbody>
    </table>
    `;
    
    dataText.innerHTML = htmlContent;

}

function set_data(data) {

    if (data == null) return;

    processedData = data;

    frame_maker.set_data(data);

    const frameCount = processedData["rawImage"].length;
    slider.max = frameCount > 0 ? frameCount - 1 : 0;

    updateImage();

}

confInput.addEventListener('change', () => {
    updateImage();
});

// 초기화 및 비디오 처리
processButton.addEventListener('click', async () => {

    // 버튼을 비활성화하여 중복 클릭 방지
    processButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new TrackProcessor();

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

slider.addEventListener('input', updateImage);