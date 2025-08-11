let isOpencvReady = false;

// HTML 파일에서 opencv.js가 로드되면 호출되는 함수
function onOpenCvReady() {
    isOpencvReady = true;
    console.log("OpenCV.js가 로드되었습니다.");
    // 여기에 메인 로직을 시작하는 함수를 호출할 수 있습니다.
    // 예를 들어, initApp();
}

// 이 함수가 전역으로 노출되어야 HTML 파일에서 접근 가능합니다.
window.onOpenCvReady = onOpenCvReady;