const { createFFmpeg, fetchFile } = FFmpeg;

export class VideoConverter {
    constructor(options = {}) {
        this.ffmpeg = createFFmpeg()
        this.isLoaded = false;
    }

    /**
     * FFmpeg 라이브러리를 로드합니다.
     */
    async load() {
        if (!this.isLoaded) {
            await this.ffmpeg.load();
            this.isLoaded = true;
            console.log('FFmpeg 로드 완료.');
        }
    }

    /**
     * 비디오 파일을 이미지 리스트로 변환합니다.
     * @param {File} file 변환할 비디오 파일
     * @param {number} fps 추출할 프레임 속도 (초당 프레임 수)
     * @returns {Promise<string[]>} 이미지 URL(Blob URL) 배열
     */
    async convert(file) {

        if (!file) {
            throw new Error('비디오 파일이 없습니다.');
        }
        if (!this.isLoaded) {
            await this.load();
        }

        const outputFileName = 'output_%d.jpg';
        const inputFileName = file.name;

        try {
            // 1. FFmpeg 가상 파일 시스템에 파일 쓰기
            this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));

            // 2. FFmpeg 명령 실행: 지정된 fps로 프레임 추출
            await this.ffmpeg.run(
                '-i', inputFileName,
                '-vf',
                '-q:v', '2',
                outputFileName
            );

            // 3. 추출된 이미지 파일 목록 가져오기
            const fileNames = this.ffmpeg.FS('readdir', '/').filter(f => f.startsWith('output_'));
            const imageList = [];

            for (const fileName of fileNames) {
                const data = this.ffmpeg.FS('readFile', fileName);
                const blob = new Blob([data.buffer], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                imageList.push(url);
            }

            // 4. 가상 파일 시스템 정리
            this.ffmpeg.FS('unlink', inputFileName);
            fileNames.forEach(f => this.ffmpeg.FS('unlink', f));

            // 5. 이미지 URL 리스트 반환
            return imageList;

        } catch (error) {
            console.error('비디오 변환 중 오류 발생:', error);
            throw error;
        }
    }
}
