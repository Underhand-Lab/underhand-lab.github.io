// media_pipe_pose_detector.js
// const kalmanFilter = require('kalmanjs'); // 칼만 필터 라이브러리 가정
import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const MEDIAPIPE_LANDMARK_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
  'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left',
  'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow',
  'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky',
  'right_pinky', 'left_index', 'right_index', 'left_thumb',
  'right_thumb', 'left_hip', 'right_hip', 'left_knee', 'right_knee',
  'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
];

export class MediaPipePoseDetector {

    poseDetector = undefined;

    async initialize() {
        console.log("초기화중")

        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
    
            console.log("초기화중11");
            this.poseDetector = await PoseLandmarker.createFromOptions(
                vision, 
                {
                    baseOptions: {
                        modelAssetPath: "https://underhand-lab.github.io/pose/external/models/pose_landmarker_full.task"
                    },
                    // ... 기타 옵션
                }
            );
            
            console.log("초기화중22");
        } catch (error) {
            console.error("PoseLandmarker 초기화 중 오류 발생:", error);
            // 오류가 발생하면 여기에 로그가 출력됩니다.
        }
    }

    async process(images) {
        // 이전 답변에서 제공된 process() 메서드와 동일
        if (!this.poseDetector) {
            console.error('PoseLandmarker가 초기화되지 않았습니다. initialize() 메서드를 먼저 호출해주세요.');
            return null;
        }

        const allRawLandmarks2d = [];
        const allWorldLandmarks3d = [];
        const allVisibilityScores = [];

        for (const image of images) {

            const results = await this.poseDetector.detect(image);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks2d = results.landmarks[0].map(l => [l.x, l.y, l.z]);
                allRawLandmarks2d.push(landmarks2d);

                const landmarks3d = results.worldLandmarks[0].map(l => [l.x, -l.y, l.z]);
                allWorldLandmarks3d.push(landmarks3d);

                const visibilityScores = results.landmarks[0].map(l => l.visibility);
                allVisibilityScores.push(visibilityScores);
            } else {
                console.warn('Warning: Pose not detected.');
            }
            
        }
        
        // 여기에 MedianFusion 및 KalmanFilter 로직을 추가
        // fusedLandmarks3d와 filteredLandmarks3d를 구현 후
        const filteredLandmarks3d = allWorldLandmarks3d[0] || null; // 임시로 첫 번째 프레임 데이터 사용
        
        // 반환 시 수정된 _numpyToDict 메서드 사용
        return {
            // 필터링된 3D 랜드마크를 변환하여 반환
            landmarks_3d: this._arrayToDict(filteredLandmarks3d),
            // 2D 랜드마크 리스트를 변환하여 반환
            landmarks_2d_list: allRawLandmarks2d.map(arr => this._arrayToDict(arr)),
            // 가시성 점수 리스트를 변환하여 반환
            visibility_score_list: allVisibilityScores.map(arr => this._arrayToDict(arr, 'visibility')),
        };
    }

    /*
    _medianFusion(allLandmarks) {
        // 로직 구현
    }

    _applyKalmanFilter(fusedLandmarks3d, allVisibilityScores) {
        // 로직 구현
    }*/

    // 배열을 딕셔너리 객체로 변환하는 새로운 메서드
    _arrayToDict(arr, valueKey = null) {
        if (!arr) return null;
        const result = {};
        for (let i = 0; i < arr.length; i++) {
            const landmarkName = MEDIAPIPE_LANDMARK_NAMES[i];
            // valueKey가 있으면 해당 키의 값만, 없으면 전체 배열을 값으로 할당
            result[landmarkName] = valueKey ? arr[i] : arr[i];
        }
        return result;
    }
}