import { appWindow } from '@tauri-apps/api/window';
interface Danmu {
    text: string;
    x: number;
    y: number;
    speed: number;
    color: string;
    font: string;
    width: number;
}
class DanmuCanvas {
    public danmus: Danmu[] = [];
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    public isPaused: boolean = false;
    public tracker: number = 0;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        
        if (!context) {
            throw new Error("Failed to get canvas rendering context");
        }

        this.canvas = canvas;
        this.context = context;
        this.context.font = '40px Arial';
        this.tracker = Math.floor((canvas.height - 40) / 20) + 1;
        // Start the animation loop
        requestAnimationFrame(() => this.update());
    }

    public addDanmu(text: string, color: string = "#FFFFFF") {
        const danmu: Danmu = {
            text: text,
            x: Math.floor(this.canvas.width),
            // y: Math.floor(Math.random() * this.canvas.height),
            y: Math.floor(Math.random() * this.tracker) * 20,
            speed: Math.floor(2 + Math.random() * 4),
            color: color,
            font: `${Math.floor(Math.random() * 20) + 25}px Arial`,
            // font: '40px Arial',
            width: this.context.measureText(text).width,
        };
        this.danmus.push(danmu);
    }

    public update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.danmus.forEach((danmu) => {
            this.context.fillStyle = danmu.color;
            this.context.textBaseline = "top";
            // 鬼畜效果，笑死爹了
            // this.context.font = `${Math.random() * 20 + 25}px Arial`;
            this.context.font = danmu.font;
            // ctmm 太卡了
            // this.context.filter = "blur(2px)";
            this.context.fillText(danmu.text, Math.floor(danmu.x), Math.floor(danmu.y));
            danmu.x -= danmu.speed;
        });

        // Remove off-screen danmus
        this.danmus = this.danmus.filter(
            (danmu) => danmu.x + this.context.measureText(danmu.text).width > 0
        );
        if (!this.isPaused && document.visibilityState === 'visible') {
            requestAnimationFrame(() => this.update());
        }
    }
}

const canvas = new DanmuCanvas("danmuCanvas");
// const danmuWorker = new Worker("worker.js");
const danmuWorker = new Worker(new URL("worker.js", import.meta.url),{type: "module"});

danmuWorker.addEventListener("message", () => {

    if(canvas.isPaused){
        return;
    }
    if (document.visibilityState !== 'visible'){
        return;
    }
    let  pixel: String = Math.floor(56 + Math.random() * 200).toString();

    let r: String = pixel + ",";
    let g: String = pixel + ",";
    let b: String = pixel;

    let rgb: string = "rgb(" + r + g + b + ")";
    canvas.addDanmu("Hello World!", rgb);
});

danmuWorker.postMessage(300);

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#addBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        let r: String = Math.floor(Math.random() * 256).toString() + ",";
        let g: String = Math.floor(Math.random() * 256).toString() + ",";
        let b: String = Math.floor(Math.random() * 256).toString();

        let rgb: string = "rgb(" + r + g + b + ")";
        canvas.addDanmu("abcdefghijklmn", rgb);
    });

    document.querySelector("#danmuCanvas")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (canvas.isPaused) {
            canvas.isPaused = false;
            canvas.update();
        } else {
            canvas.isPaused = true;
        }
        
    });

    document.querySelector("#danmuCanvas")?.addEventListener("mousemove", (e) => {
        let mouseX = (e as MouseEvent).clientX;
        let mouseY = (e as MouseEvent).clientY;

        canvas.danmus.forEach(danmu => {

            if (canvas.isPaused) {
                if((mouseX > danmu.x) && (mouseX < danmu.x + danmu.width) && (mouseY > danmu.y) && (mouseY < danmu.y + 40)) {
                    canvas.isPaused = true;
                    console.log("in!!!");
                }
            }

        });
        // console.log(mouseX, mouseY);
    });

    window.addEventListener("resize",()=>{
        (document.getElementById("danmuCanvas") as HTMLCanvasElement).width = window.innerWidth;
        (document.getElementById("danmuCanvas") as HTMLCanvasElement).height = window.innerHeight;
    });

    document.addEventListener("keydown",(e)=>{
        e.preventDefault();
        if(e.key === "Escape"){
            appWindow.close();
        }
    })
    
});
