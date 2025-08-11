// joint_analysis_tool.js
const ndarray = require('ndarray');

const jointCalcParameter = {
    'left_shoulder': ['left_elbow', 'left_shoulder', 'left_hip'],
    'right_shoulder': ['right_elbow', 'right_shoulder', 'right_hip'],
    'left_elbow': ['left_shoulder', 'left_elbow', 'left_wrist'],
    'right_elbow': ['right_shoulder', 'right_elbow', 'right_wrist'],
    'left_hip': ['left_shoulder', 'left_hip', 'left_knee'],
    'right_hip': ['right_shoulder', 'right_hip', 'right_knee'],
    'left_knee': ['left_hip', 'left_knee', 'left_ankle'],
    'right_knee': ['right_hip', 'right_knee', 'right_ankle'],
};

export class JointAnalysisTool {
    calc(data) {
        const landmarks3dList = data.getLandmarks3d();
        const results = landmarks3dList.map(landmarks3d => {
            if (!landmarks3d) return {};
            return this._calcJoints(landmarks3d);
        });
        // PandasDataFrame 대신 일반 자바스크립트 배열 반환
        return results;
    }

    _calcJoints(joints) {
        // 관절 각도 계산 로직
        // ndarray를 사용한 벡터 연산으로 `calculate_angle` 함수 구현
        const ret = {};
        // ... (계산 로직)
        return ret;
    }
}

function calculateAngle(vec1, vec2) {
    // ndarray를 사용하여 벡터 연산
    const dotProduct = tf.dot(vec1, vec2);
    const norm1 = tf.norm(vec1);
    const norm2 = tf.norm(vec2);
    const cosineAngle = dotProduct / (norm1 * norm2);
    const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosineAngle)));
    return angleRadians * 180 / Math.PI;
}

// 기타 calculate_angle_3, calculate_angle_4 함수도 유사하게 구현