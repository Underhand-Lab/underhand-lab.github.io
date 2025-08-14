import { IPoseFrameMaker } from "./pose_frame_maker.js"

const hideAfterIndexPlugin = {
    id: 'hideAfterIndex',
    beforeDatasetDraw(chart, args, options) {
        const { idx } = options;
        const datasetIndex = args.index;
        const dataArr = chart.data.datasets[datasetIndex].data;

        args.meta.data.forEach((point, i) => {
            const rawVal = dataArr[i]; // 원본 데이터에서 직접 읽기
            const isNull = rawVal === null || rawVal === undefined;
            if (i > idx || isNull) {
                point.skip = true;
            } else {
                point.skip = false;
            }
        });
    }
};

export class GraphFrameMaker extends IPoseFrameMaker {

    constructor(canvas) {
        super();
        this.target_idx = 0;
        this.canvas = canvas;
    }

    get_data_set() {

        if (this.data == null) return null;

        let len = 0;
        let ret = [];

        for (let key in this.data) {
            ret.push({
                "label": key,
                "data": this.data[key],
                "borderColor": getRandomColor(),
                "borderWidth": 4,
                "pointRadius": 0
            });
            if (len < this.data[key].length)
                len = this.data[key].length;
        }

        const labels = Array.from({ length: len },
            (_, index) => index);

        return [ret, labels];
    }

    set_data(data) {

        this.data = data;
        console.log(data);

        if (this.chart != null) {
            let [dataset, labels] = this.get_data_set();

            this.chart.data["labels"] = labels;
            this.chart.data.datasets = dataset;
        }
        

    }

    draw_img_at(idx, canvas) {

        if (this.data == null) return;


        if (this.chart == null) {
            let [dataset, labels] = this.get_data_set();

            const ctx = canvas.getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    "labels": labels,
                    datasets: dataset
                },
                options: {
                    animation: false,
                    plugins: {
                        hideAfterIndex: { idx: idx }
                    }
                },
                plugins: [hideAfterIndexPlugin]
            });
            
        } else {
            this.chart.options.plugins.hideAfterIndex.idx = idx;
            this.chart.update();

        }
    }

}

function getRandomColor() {
  let red = Math.floor(Math.random() * 256);
  let green = Math.floor(Math.random() * 256);
  let blue = Math.floor(Math.random() * 256);
  return `rgb(${red}, ${green}, ${blue})`;
}