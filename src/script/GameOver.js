/**
*
* @author lbin
* @data: 2024-03-19 16:43
*/
export default class GameOver extends Laya.Script {

    constructor() {
        super()
    }

    onAwake() {
        let dialog, closeBtn, againGameBtn;
        dialog = this.owner.getChildByName("dialog");
        closeBtn = dialog.getChildByName("closeBtn");
        againGameBtn = dialog.getChildByName("againGame");
        // dialog.on(Laya.Event.MOUSE_DOWN, this, () => { dialog.startDrag(); });
        closeBtn.on(Laya.Event.MOUSE_DOWN, this, () => { this.owner.close(); });
        againGameBtn.on(Laya.Event.MOUSE_DOWN, this, () => {
            // 再来一次
            Laya.stage.event('againGame')
            this.owner.close()
        });

    }

}