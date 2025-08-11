// processed_data.js

class ProcessedData {
    constructor() {
        this.raw_video_width_list = [];
        this.raw_video_height_list = [];
        this.raw_video_fps = 0;
        
        this.raw_img_list_list = [];
        this.landmarks_3d_list = [];
        this.landmarks_2d_list_list = [];
        this.visibility_score_list_list = [];
    }

    initialize(width_list, height_list, fps, frame_cnt) {
        this.raw_video_width_list = width_list;
        this.raw_video_height_list = height_list;
        this.raw_video_fps = fps;
        
        this.raw_img_list_list = Array.from({ length: width_list.length }, () => []);
        this.landmarks_2d_list_list = Array.from({ length: width_list.length }, () => []);
        this.visibility_score_list_list = Array.from({ length: width_list.length }, () => []);

        // 프레임 수에 맞게 미리 배열 크기를 설정하거나, push()를 사용하여 동적으로 추가할 수 있습니다.
        // 여기서는 동적으로 추가하는 방식으로 구현합니다.
    }

    add_data_at(raw_img_list, landmarks_3d, landmarks_2d_list, visibility_score_list) {
        for (let i = 0; i < raw_img_list.length; i++) {
            this.raw_img_list_list[i].push(raw_img_list[i]);
            this.landmarks_2d_list_list[i].push(landmarks_2d_list[i]);
            this.visibility_score_list_list[i].push(visibility_score_list[i]);
        }
        this.landmarks_3d_list.push(landmarks_3d);
    }

    get_frame_cnt() {
        if (this.raw_img_list_list.length > 0) {
            return this.raw_img_list_list[0].length;
        }
        return 0;
    }

    get_raw_img_list(idx) {
        return this.raw_img_list_list[idx];
    }
    
    get_landmarks_3d() {
        return this.landmarks_3d_list;
    }
    
    get_landmarks_2d_list(idx) {
        return this.landmarks_2d_list_list[idx];
    }
    
    get_visibility_score_list(idx) {
        return this.visibility_score_list_list[idx];
    }
}

export { ProcessedData };