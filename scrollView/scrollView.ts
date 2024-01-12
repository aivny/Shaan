import { appWindow } from '@tauri-apps/api/window';
import { invoke } from "@tauri-apps/api/tauri";
interface Danmu {
    text: string;
    content: string;
    x: number;
    y: number;
    speed: number;
    color: string;
    font: string;
    width: number;
}

interface Input{
    title: string;
    content: string;
    id: number;
}
class DanmuCanvas {
    public inputs: Input[] = [];
    public danmus: Danmu[] = [];
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    public isPaused: boolean = false;
    public tracker: number = 0;
    public trackArr: number[] = [];
    public counter :number = 0;
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

    public addDanmu(text: string, content:string, color: string = "#FFFFFF") {
        const danmu: Danmu = {
            text: text,
            content: content,
            x: Math.floor(this.canvas.width),
            // y: Math.floor(Math.random() * this.canvas.height),
            // y: Math.floor(Math.random() * this.tracker) * 20,
            y: this.trackSelector() * 20,
            speed: Math.floor(2 + Math.random() * 4),
            color: color,
            font: `${Math.floor(Math.random() * 20) + 25}px Arial`,
            // font: '40px Arial',
            width: this.context.measureText(text).width,
        };
        this.danmus.push(danmu);
        console.log(danmu.y / 20);
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
            (danmu) => danmu.x + this.context.measureText(danmu.text).width + 100 > 0
        );
        if (!this.isPaused && document.visibilityState === 'visible') {
            requestAnimationFrame(() => this.update());
        }
    }

    public trackSelector(){
        
        if((this.counter % (this.tracker - 1)) == 0){
            this.trackArr = Array.from({ length: this.tracker }, (_, index) => index + 1);
            this.counter = 0;
            for (let i = this.trackArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.trackArr[i], this.trackArr[j]] = [this.trackArr[j], this.trackArr[i]];
              }
        }
        let track = this.trackArr[this.counter];
        this.counter++;
        return track;
    }
}

async function getAll(){
    await invoke("get_all_minds").then(
      (res) => {
        console.log(res);
        canvas.inputs = res as Input[];
      }
    )
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
    let  pixel: String = Math.floor(Math.random() * 200).toString();

    let r: String = pixel + ",";
    let g: String = pixel + ",";
    let b: String = pixel;

    let rgb: string = "rgb(" + r + g + b + ")";
    let oneDanmu: Input = canvas.inputs[Math.floor(Math.random() * canvas.inputs.length)];
    
//    canvas.addDanmu("Hello World!", rgb);
    canvas.addDanmu(oneDanmu.title, oneDanmu.content,rgb);
});

danmuWorker.postMessage(700);

window.addEventListener("DOMContentLoaded", () => {
    getAll();

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
