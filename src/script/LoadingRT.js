/**
*
* @author lbin
* @data: 2024-03-18 11:39
*/
import { LoadingUI } from "./../ui/layaMaxUI";
export default class LoadingRT extends Laya.Script {

    constructor() {
        super()

        /** @prop {name: progress, tips: "进度条", type: Node, default: null} */
        this.progress = null
        /** @prop {name: progressText, tips: "进度条", type: Node, default: null} */
        this.progressText = null
    }

    onAwake() {
        let resArr = [
            'res/image/game2.png',
            'res/image/game4.png',
            'res/image/game8.png',
            'res/image/game16.png',
            'res/image/game32.png',
            'res/image/game64.png',
            'res/image/game128.png',
            'res/image/game256.png',
            'res/image/game512.png',
            'res/image/game1024.png',
            'res/image/game2048.png',
            'res/image/game4096.png'
        ];
        //加载
        Laya.loader.create(resArr, Laya.Handler.create(this, this.onLoaded), Laya.Handler.create(this, this.onLoading));
        // 侦听加载失败
        Laya.loader.on(Laya.Event.ERROR, this, this.onError);
    }

    /**
      * 当报错时打印错误
      * @param err 报错信息
      */
    onError(err) {
        console.log("加载失败: " + err);
    }

    /**
     * 加载时侦听
     */
    onLoading(progress) {
        //接近完成加载时，让显示进度比实际进度慢一点，这是为打开场景时的自动加载预留，尤其是要打开的场景资源多，并没有完全放到预加载中，还需要再自动加载一部分时。
        if (progress > 0.92) {
            this.progress.value = 0.95;
        }
        else {
            this.progress.value = progress;
        }
        this.progressText.text = `正在加载中：${(this.progress.value * 100).toFixed(0)}%`

        console.log("加载进度: " + progress, this.progress.value);
    }

    /**
     * 加载完成后，处理逻辑
     */
    onLoaded() {
        this.progress.value = 0.98;
        console.log("加载结束", this.progress.value);
        this.progressText.text = '加载完毕，正在进入游戏'
        
        Laya.Scene.open("index.scene");
    }

    onUpdate() {
        // 加载进度条
        // if (this.progress.value < 1) {
        //     this.progress.value += 0.01
        //     // console.log('加载进度条', this.progress.value);

        //     this.progressText.text = `正在加载中：${(this.progress.value * 100).toFixed(0)}%`
        //     if (this.progress.value == 1) {
        //         this.progressText.text = '加载完毕，正在进入游戏'
        //         Laya.timer.once(200, this, () => {
        //             //跳转到入口场景
        //             Laya.Scene.open("index.scene")
        //         });
        //     }
        // }
    }

}