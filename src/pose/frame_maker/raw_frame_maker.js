import { IPoseFrameMaker } from "./pose_frame_maker.js"

export class RawFrameMaker extends IPoseFrameMaker {
    constructor(canvas) {
        super();
        this.raw_img_list = null
        this.target_idx = 0;
        this.canvas = canvas;
    }

    set_data(processedData) {
        this.processedData = processedData;
        this.size = processedData.get_video_metadata(this.target_idx);
        this.raw_img_list = processedData.get_raw_img_list(this.target_idx);
        this.landmark_2d_list = processedData.get_landmarks_2d_list(this.target_idx);

    }

    draw_img_at(idx, canvas) {

        const ctx = canvas.getContext('2d');

        const image = this.raw_img_list[idx];

        if (!image) {
            console.error("Image not found at index", idx);
            return;
        }

        // 1. 캔버스 전체를 검정색으로 채웁니다 (레터박스 배경)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 이미지와 캔버스의 종횡비를 계산합니다.
        const imageAspectRatio = image.width / image.height;
        const canvasAspectRatio = canvas.width / canvas.height;

        let drawWidth;
        let drawHeight;
        let offsetX;
        let offsetY;

        // 3. 종횡비에 따라 이미지를 그릴 크기와 위치를 결정합니다.
        if (imageAspectRatio > canvasAspectRatio) {
            // 이미지가 캔버스보다 가로로 긴 경우 (상하 레터박스)
            drawWidth = canvas.width;
            drawHeight = canvas.width / imageAspectRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }
        else {
            // 이미지가 캔버스보다 세로로 긴 경우 (좌우 레터박스)
            drawHeight = canvas.height;
            drawWidth = canvas.height * imageAspectRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        // 4. 계산된 크기와 위치에 맞춰 이미지를 그립니다.
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    }

    get_img_at(idx) {
        if (this.raw_img_list == null) return;
        if (idx >= this.raw_img_list.length) {
            return null;
        }
        return draw_pose_on_frame(this.raw_img_list[idx]);
    }
}