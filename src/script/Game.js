/**
*
* @author lbin
* @data: 2024-03-18 14:00
*/
const gameImages = {
    game2: './res/image/game2.png',
    game4: './res/image/game4.png',
    game8: './res/image/game8.png',
    game16: './res/image/game16.png',
    game32: './res/image/game32.png',
    game64: './res/image/game64.png',
    game128: './res/image/game128.png',
    game256: './res/image/game256.png',
    game512: './res/image/game512.png',
    game1024: './res/image/game1024.png',
    game2048: './res/image/game2048.png',
    game4096: './res/image/game4096.png'
}
const girdBoxBg = ('./res/image/box_bg.png')
const Tween = Laya.Tween
export default class Game extends Laya.Script {

    constructor() {
        super()

        // 分数
        this.score = 0
        this.scoreText = null
        // 最高分数
        this.maxScore = 0
        this.maxScoreText = null

        // 16个盒子, 基础位置
        this.boxGrid = []
        this.boxScore = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
        // 有数字后的位置
        this.gameBoxGrid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]

        // 游戏区域主体
        this.gameBox = null

        // 是否移动，初始位置
        this.isMove = false
        this.beginPosition = { x: 0, y: 0 }
        this.delay = 0

        // 游戏结束
        this.isGameOver = false
    }

    onAwake() {
        console.log(this.owner._children);
        
        // _children.forEach(item => {
        //     this.owner.removeChild(item)
        // })
        // 游戏主体
        this.initBox()

        // 分数设置
        this.initScore()

        // 再来一次
        Laya.stage.on('againGame', this, this.againGame)
    }

    initScore() {
        // 分数设置
        this.scoreText = this.createScoreText()
        this.scoreText.text = `当前分数：${this.score}`
        this.scoreText.y = 200
        this.scoreText.name = 'scoreText'
        this.owner.addChild(this.scoreText)

        
        // 初始化最高分数
        this.maxScore = Laya.LocalStorage.getItem('2048_MAX_SCORE') || 0
        this.maxScoreText = this.createScoreText()
        this.maxScoreText.text = `最高分数：${this.maxScore}`
        this.maxScoreText.y = 200
        this.maxScoreText.x = 375
        this.maxScoreText.name = 'maxScoreText'
        this.owner.addChild(this.maxScoreText);
    }

    setScore(val) {
        this.score = val == 0 ? val : (this.score + val)
        if (this.score > this.maxScore) {
            this.maxScore = this.score
            
            Laya.LocalStorage.setItem('2048_MAX_SCORE', this.score)
        }

        this.scoreText.text = `当前分数：${this.score}`
        this.maxScoreText.text = `最高分数：${this.maxScore}`
    }

    createScoreText() {
        const text = new Laya.Text()
        text.overflow = Text.HIDDEN;
        text.color = "#FFFFFF";
        text.font = "Impact";
        text.fontSize = 30
        text.width = 375
        text.height = 60
        text.align = 'center'
        text.valign = 'middle'
        text.text = `当前分数：${this.score}`

        return text
    }

    initBox() {
        // 游戏区域主体
        const boxBg = "./res/image/box_bg.png"
        this.gameBox = new Laya.Sprite();
        this.gameBox.loadImage(boxBg);
        this.gameBox.y = 300
        this.gameBox.name = 'gameBox'
        this.owner.addChild(this.gameBox);
        //操作监听
        this.actionListening()

        // console.log('加载背景图', this.gameBox, this.gameBox);


        // 游戏区域基础小格子背景
        for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
            for (let colIndex = 0; colIndex < 4; colIndex++) {
                let box = new Laya.Sprite();
                box.loadImage(girdBoxBg);
                box.x = 40 + (colIndex * 172)
                box.y = 380 + (rowIndex * 172)
                box.width = 152
                box.height = 152
                box.name = 'gameBoxBase' + rowIndex + colIndex

                this.owner.addChild(box);

                if (!this.boxGrid[rowIndex]) {
                    this.boxGrid[rowIndex] = [null, null, null, null]
                }
                this.boxGrid[rowIndex][colIndex] = box


                // console.log('加载box', this.boxGrid[rowIndex][colIndex].x, this.boxGrid[rowIndex][colIndex].y)
            }
        }
        // console.log('加载box', this.boxGrid)


        // this.randomBox(15, 2)
        // this.randomBox(14, 2)
        // this.randomBox(13, 2)
        // this.randomBox(11, 2)
        // this.randomBox(8, 2)
        // this.randomBox(7, 2)
        // this.randomBox(4, 2)
        // this.randomBox(2, 2)
        // this.randomBox(1, 2)
        // this.randomBox(0, 2)
        this.randomBox()
    }

    // 随机一个空位生成数字
    randomBox(position, val) {
        // 视二维数组为1 - 16个数，从左到右，从上到下，将空着的格子对应数字放入list
        let list = []

        this.boxScore.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if (col === 0) {
                    // 0: 1 - 16 key，空着的位置, 1、2：节点对应位置
                    list.push([(rowIndex * 4) + (colIndex + 1), rowIndex, colIndex])
                }
            })
        })

        if (!list || list.length < 1) {
            this.gameOver()
            return
        }

        // 随机生成的数字, 2或者4
        const randomNum = val || this.power(2, this.getRandomBum(2))
        const image = gameImages[`game${randomNum}`]

        // 随机位置
        const index = position == undefined ? this.getRandomBum(list.length - 1, 0) : position
        const baseBox = this.boxGrid[list[index][1]][list[index][2]]

        let box = new Laya.Sprite();
        box.loadImage(image);
        box.x = baseBox.x
        box.y = baseBox.y
        box.width = 152
        box.height = 152
        box.name = 'gameBoxData' + randomNum

        this.owner.addChild(box);

        // 加入二维数组对应位置
        this.boxScore[list[index][1]][list[index][2]] = randomNum
        this.gameBoxGrid[list[index][1]][list[index][2]] = box
    }


    /**
     * min 到 max 之间的随机整数
     * @param {*} max 
     * @param {*} min 
     * @returns 
     */
    getRandomBum(max, min = 1) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    /**
     * base 的 exponent次方
     * @param {*} base 
     * @param {*} exponent 
     * @returns 
     */
    power(base, exponent) {
        let result = 1;
        for (let i = 0; i < exponent; i++) {
            result *= base;
        }
        return result;
    }

    /**
     * 游戏结束，
     * 结束判断待完善
     */
    gameOver() {
        if (this.checkSameScore(this.boxScore)) {
            console.log('格子满了，但有相邻且相同的数字', this.boxScore)
            return
        }
        this.isGameOver = true
        Laya.Scene.open("gameOver.scene", false)
    }

    /**
     * 检测二维数组是否还有相同且相邻的数字
     */
    checkSameScore(matrix) {  
        const rows = matrix.length;  
        const cols = matrix[0].length;  
      
        // 遍历二维数组的每个元素  
        for (let i = 0; i < rows; i++) {  
            for (let j = 0; j < cols; j++) {  
                const currentElement = matrix[i][j];  
      
                // 检查上方元素  
                if (i > 0 && matrix[i - 1][j] === currentElement) {  
                    return true; // 如果找到相邻且相同的元素，返回true  
                }  
      
                // 检查下方元素  
                if (i < rows - 1 && matrix[i + 1][j] === currentElement) {  
                    return true; // 如果找到相邻且相同的元素，返回true  
                }  
      
                // 检查左方元素  
                if (j > 0 && matrix[i][j - 1] === currentElement) {  
                    return true; // 如果找到相邻且相同的元素，返回true  
                }  
      
                // 检查右方元素  
                if (j < cols - 1 && matrix[i][j + 1] === currentElement) {  
                    return true; // 如果找到相邻且相同的元素，返回true  
                }  
            }  
        }  
      
        // 如果没有找到相邻且相同的元素，返回false  
        return false;  
    }  

    // 再来一次
    againGame() {
        const names = ['maxScoreText', 'scoreText', 'main_bg', 'bug_2048']
        const _children = this.owner._children.filter(item => !names.includes(item.name))
        _children.forEach(item => {
            this.owner.removeChild(item)
        })

        this.isGameOver = false
        this.setScore(0)
        this.boxGrid = []
        this.boxScore = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
        this.gameBoxGrid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]

        console.log(this.owner._children);
        this.initBox()
    }


    // 操作监听
    actionListening() {
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.keyActionBox)
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.startMove)
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.endMove);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, () => {
            this.isMove = true
        });
    }

    // 键盘操作
    keyActionBox(e) {
        const Keyboard = Laya.Keyboard;
        switch (e.keyCode) {
            case Keyboard.LEFT:
                this.moveBox('turnLeft')
                break;
            case Keyboard.RIGHT:
                this.moveBox("turnRight");
                break;
            case Keyboard.UP:
                this.moveBox("turnUp");
                break;
            case Keyboard.DOWN:
                this.moveBox("turnDown");
                break;
        }
    }

    // 按下事件处理
    startMove(e) {
        this.beginPosition = {
            x: e.stageX,
            y: e.stageY
        }
        // console.log('按下事件处理', e, this.beginPosition);
    }

    // 抬起事件处理
    endMove(e) {
        const nowTime = Date.now()
        if (!this.isMove || (nowTime - this.delay) < 50) {
            return
        }


        this.isMove = false
        this.delay = nowTime

        const absDistanceX = Math.abs(e.stageX - this.beginPosition.x)
        const absDistanceY = Math.abs(e.stageY - this.beginPosition.y)
        const distanceX = e.stageX - this.beginPosition.x
        const distanceY = e.stageY - this.beginPosition.y

        if (absDistanceX < 5 || absDistanceY < 5) {
            return
        }

        // 格子左右移动，依据X，Y差值
        if (absDistanceX > absDistanceY) {
            if (distanceX > 0) {
                this.moveBox("turnRight")
            } else {
                this.moveBox('turnLeft')
            }
        } else {
            if (distanceY > 0) {
                this.moveBox("turnDown");
            } else {
                this.moveBox("turnUp");
            }
        }
        // console.log('抬起事件处理', distanceX, distanceY, this.isMove);

    }


    /**
     * 
     * @param {*} action 移动的方向
     */
    moveBox(action) {
        // 游戏结束直接返回
        if (this.isGameOver) {
            const scenceList = Laya.Scene.root._children
            const gameOverScence = scenceList.find(item => item.name === 'gameOver')

            if (!gameOverScence || !gameOverScence.active) {
                Laya.Scene.open("gameOver.scene", false)
            }

            console.log('游戏结束直接返回', scenceList, gameOverScence)
            return
        }

        // 移动的步数
        let step = 0
        if (action === 'turnLeft') {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                for (let colIndex = 0; colIndex < 4; colIndex++) {
                    if (this.boxScore[rowIndex][colIndex] !== 0) {
                        if (step === 0) continue
                        this.changeScore(true, true, rowIndex, colIndex, step)
                        continue
                    }

                    step++
                }
                step = 0
            }
        }
        if (action === 'turnRight') {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                for (let colIndex = 3; colIndex > -1; colIndex--) {
                    if (this.boxScore[rowIndex][colIndex] !== 0) {
                        if (step === 0) continue
                        this.changeScore(true, false, rowIndex, colIndex, step)
                        continue
                    }

                    step++
                }
                step = 0
            }
        }
        if (action === 'turnUp') {
            for (let colIndex = 0; colIndex < 4; colIndex++) {
                for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                    if (this.boxScore[rowIndex][colIndex] !== 0) {
                        if (step === 0) continue
                        this.changeScore(false, true, rowIndex, colIndex, step)
                        continue
                    }
                    step++
                }
                step = 0
            }
        }
        if (action === 'turnDown') {
            for (let colIndex = 0; colIndex < 4; colIndex++) {
                for (let rowIndex = 3; rowIndex > - 1; rowIndex--) {
                    if (this.boxScore[rowIndex][colIndex] !== 0) {
                        if (step === 0) continue
                        this.changeScore(false, false, rowIndex, colIndex, step)
                        continue
                    }
                    step++
                }
                step = 0
            }
        }

        // 合并分数 Tween缓动100ms后生效，故此延迟100ms
        Laya.timer.once(110, this, () => {
            this.mergeScore(action)

            // 生成新的数字
            this.randomBox()
        });
        // console.log(action, this.gameBoxGrid)
        // console.log(this.boxScore)
        // console.log(this.owner._children);
    }

    /**
     * 改变位置
     * 
     * @param {*} isHorizontal 是否是水平方向的移动
     * @param {*} isReduce 左和上的方向为reduce
     * @param {*} rowIndex 二维数组垂直坐标
     * @param {*} colIndex 二维数组水平坐标
     * @param {*} step 移动的步数
     */
    changeScore(isHorizontal, isReduce = false, rowIndex, colIndex, step) {
        // 移动参数
        const param = {}
        // 最终坐标
        let targetRow = isReduce ? (rowIndex - step) : (rowIndex + step)
        let targetCol = isReduce ? (colIndex - step) : (colIndex + step)

        if (isHorizontal) { // 水平方向则不移动Y坐标
            targetRow = rowIndex
            let positionX = this.gameBoxGrid[rowIndex][colIndex].x
            param.x = isReduce ? (positionX - (step * 172)) : (positionX + (step * 172))

        } else { // 垂直方向则不移动X坐标
            targetCol = colIndex
            let positionY = this.gameBoxGrid[rowIndex][colIndex].y
            param.y = isReduce ? (positionY - (step * 172)) : (positionY + (step * 172))
        }

        // 分数位置变动
        this.boxScore[targetRow][targetCol] = this.boxScore[rowIndex][colIndex]
        this.boxScore[rowIndex][colIndex] = 0

        // 数字box移动
        Tween.to(this.gameBoxGrid[rowIndex][colIndex], param, 100)
        this.gameBoxGrid[targetRow][targetCol] = this.gameBoxGrid[rowIndex][colIndex]
        this.gameBoxGrid[rowIndex][colIndex] = null
    }

    mergeScore(direction) {
        if (direction == 'turnLeft') {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                let score = 0
                for (let colIndex = 0; colIndex < 4; colIndex++) {
                    if (colIndex == 0) {
                        score = this.boxScore[rowIndex][colIndex]
                        continue
                    }

                    // 合并后，其余分数移动
                    if (score == 0 && this.boxScore[rowIndex][colIndex] != 0) {
                        this.boxScore[rowIndex][colIndex - 1] = this.boxScore[rowIndex][colIndex]
                        this.boxScore[rowIndex][colIndex] = 0


                        Tween.to(this.gameBoxGrid[rowIndex][colIndex], {
                            x: (this.gameBoxGrid[rowIndex][colIndex].x - 172)
                        }, 100)
                        this.gameBoxGrid[rowIndex][colIndex - 1] = this.gameBoxGrid[rowIndex][colIndex]
                        this.gameBoxGrid[rowIndex][colIndex] = null
                    }

                    // 相同分数合并
                    if (this.boxScore[rowIndex][colIndex] == score && score != 0) {
                        this.boxScore[rowIndex][colIndex - 1] = score * 2
                        this.boxScore[rowIndex][colIndex] = 0

                        const sprite = this.gameBoxGrid[rowIndex][colIndex - 1]
                        sprite.loadImage(gameImages[`game${score * 2}`])
                        this.owner.removeChild(this.gameBoxGrid[rowIndex][colIndex])
                        this.gameBoxGrid[rowIndex][colIndex] = null

                        // 设置页面分数
                        this.setScore(score * 2)
                        score = 0
                        continue
                    }

                    score = this.boxScore[rowIndex][colIndex]
                }
            }
        }
        if (direction == 'turnRight') {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                let score = 0
                for (let colIndex = 3; colIndex > -1; colIndex--) {
                    if (colIndex == 3) {
                        score = this.boxScore[rowIndex][colIndex]
                        continue
                    }

                    // 合并后，其余分数移动
                    if (score == 0 && this.boxScore[rowIndex][colIndex] != 0) {
                        this.boxScore[rowIndex][colIndex + 1] = this.boxScore[rowIndex][colIndex]
                        this.boxScore[rowIndex][colIndex] = 0


                        Tween.to(this.gameBoxGrid[rowIndex][colIndex], {
                            x: this.gameBoxGrid[rowIndex][colIndex].x + 172
                        }, 100)
                        this.gameBoxGrid[rowIndex][colIndex + 1] = this.gameBoxGrid[rowIndex][colIndex]
                        this.gameBoxGrid[rowIndex][colIndex] = null
                    }


                    // 相同分数合并
                    if (this.boxScore[rowIndex][colIndex] == score && score != 0) {
                        this.boxScore[rowIndex][colIndex + 1] = score * 2
                        this.boxScore[rowIndex][colIndex] = 0

                        const sprite = this.gameBoxGrid[rowIndex][colIndex + 1]
                        sprite.loadImage(gameImages[`game${score * 2}`])
                        this.owner.removeChild(this.gameBoxGrid[rowIndex][colIndex])
                        this.gameBoxGrid[rowIndex][colIndex] = null

                        // 设置页面分数
                        this.setScore(score * 2)
                        score = 0
                        continue
                    }

                    score = this.boxScore[rowIndex][colIndex]
                }
            }
        }
        if (direction == 'turnUp') {
            for (let colIndex = 0; colIndex < 4; colIndex++) {
                let score = 0
                for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                    if (rowIndex == 0) {
                        score = this.boxScore[rowIndex][colIndex]
                        continue
                    }

                    // 合并后，其余分数移动
                    if (score == 0 && this.boxScore[rowIndex][colIndex] != 0) {
                        this.boxScore[rowIndex - 1][colIndex] = this.boxScore[rowIndex][colIndex]
                        this.boxScore[rowIndex][colIndex] = 0


                        Tween.to(this.gameBoxGrid[rowIndex][colIndex], {
                            y: this.gameBoxGrid[rowIndex][colIndex].y - 172
                        }, 100)
                        this.gameBoxGrid[rowIndex - 1][colIndex] = this.gameBoxGrid[rowIndex][colIndex]
                        this.gameBoxGrid[rowIndex][colIndex] = null
                    }


                    // 相同分数合并
                    if (this.boxScore[rowIndex][colIndex] == score && score != 0) {
                        this.boxScore[rowIndex - 1][colIndex] = score * 2
                        this.boxScore[rowIndex][colIndex] = 0

                        const sprite = this.gameBoxGrid[rowIndex - 1][colIndex]
                        sprite.loadImage(gameImages[`game${score * 2}`])
                        this.owner.removeChild(this.gameBoxGrid[rowIndex][colIndex])
                        this.gameBoxGrid[rowIndex][colIndex] = null

                        // 设置页面分数
                        this.setScore(score * 2)
                        score = 0
                        continue
                    }

                    score = this.boxScore[rowIndex][colIndex]
                }
            }
        }
        if (direction == 'turnDown') {
            for (let colIndex = 0; colIndex < 4; colIndex++) {
                let score = 0
                for (let rowIndex = 3; rowIndex > - 1; rowIndex--) {
                    if (rowIndex == 3) {
                        score = this.boxScore[rowIndex][colIndex]
                        continue
                    }

                    // 合并后，其余分数移动
                    if (score == 0 && this.boxScore[rowIndex][colIndex] != 0) {
                        this.boxScore[rowIndex + 1][colIndex] = this.boxScore[rowIndex][colIndex]
                        this.boxScore[rowIndex][colIndex] = 0


                        Tween.to(this.gameBoxGrid[rowIndex][colIndex], {
                            y: this.gameBoxGrid[rowIndex][colIndex].y + 172
                        }, 100)
                        this.gameBoxGrid[rowIndex + 1][colIndex] = this.gameBoxGrid[rowIndex][colIndex]
                        this.gameBoxGrid[rowIndex][colIndex] = null
                    }


                    // 相同分数合并
                    if (this.boxScore[rowIndex][colIndex] == score && score != 0) {
                        this.boxScore[rowIndex + 1][colIndex] = score * 2
                        this.boxScore[rowIndex][colIndex] = 0

                        const sprite = this.gameBoxGrid[rowIndex + 1][colIndex]
                        sprite.loadImage(gameImages[`game${score * 2}`])
                        this.owner.removeChild(this.gameBoxGrid[rowIndex][colIndex])
                        this.gameBoxGrid[rowIndex][colIndex] = null

                        // 设置页面分数
                        this.setScore(score * 2)
                        score = 0
                        continue
                    }

                    score = this.boxScore[rowIndex][colIndex]
                }
            }
        }
    }
}