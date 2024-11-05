/**
 * 代码均由ChatGPT生成，如有侵权请联系作者删除
 * 作者：张敬玉
 */
// 异步函数，用于设置背景图
async function setBackground() {
    try {
        // 发起请求获取背景图片
        const response = await fetch('https://www.loliapi.com/acg/');
        
        // 如果响应状态不是成功，抛出错误
        if (!response.ok) {
            throw new Error('网络请求失败，状态码：' + response.status);
        }else{
            response = await response.json().data;
            const imageBlob = (await fetch(response)).blob;
        }

        // 将响应转换为Blob对象，并生成一个图片URL
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        // 将获取到的图片设置为页面背景
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover'; // 背景图片覆盖整个页面
        document.body.style.backgroundPosition = 'center'; // 背景图片居中显示
        document.body.style.backgroundRepeat = 'no-repeat'; // 背景图片不重复
    } catch (error) {
        // 如果请求失败，输出错误信息，并设置默认背景图
        console.error('无法加载背景图片：', error);
        document.body.style.backgroundImage = 'url("404.jpg")';
        document.body.style.backgroundSize = '50%'; // 缩小背景图的尺寸
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        alert('背景图丢失，已设置默认背景图');
        // 获取页面中所有的 <p> 标签（返回一个 HTMLCollection）
        const pElements = document.getElementsByTagName('p');
        // 将 HTMLCollection 转为数组，遍历所有的 <p> 元素并修改颜色
        Array.from(pElements).forEach(p => {
            p.style.color = 'white'; // 将每个 <p> 的文本颜色修改为蓝色
        });
        const h1Element = document.getElementsByTagName('h1')[0]; // 获取标题元素
        h1Element.style.color = 'white'; // 修改 <h1> 的颜色
        // 获取页面中所有的 <h2> 标签（返回一个 HTMLCollection）
        const h2Elements = document.getElementsByTagName('h2');
        // 将 HTMLCollection 转为数组，遍历所有的 <h2> 元素并修改颜色
        Array.from(h2Elements).forEach(h2 => {
            h2.style.color = 'white'; // 将每个 <h2> 的文本颜色修改为蓝色
        });
    }
}
/**
 * 定义一个名为 Flipper 的类，用于创建和管理卡片翻转效果
 * @class Flipper
 * @param {HTMLElement} node - 要应用翻转效果的 DOM 节点
 * @param {number} currentTime - 当前时间
 * @param {number} nextTime - 下一时间
 * @property {boolean} isFlipping - 表示卡片是否正在翻转的状态
 * @property {number} duration - 翻转效果的持续时间（毫秒）
 * @property {HTMLElement} flipNode - 应用翻转效果的 DOM 节点
 * @property {HTMLElement} frontNode - 卡片正面的 DOM 节点
 * @property {HTMLElement} backNode - 卡片背面的 DOM 节点
 * @method setFrontTime - 设置卡片正面的时间
 * @method setBackTime - 设置卡片背面的时间
 */
var Flipper = /** @class */ (function () {
    function Flipper(node, currentTime, nextTime) {
        this.isFlipping = false;
        this.duration = 600;
        this.flipNode = node;
        this.frontNode = node.querySelector(".front");
        this.backNode = node.querySelector(".back");
        this.setFrontTime(currentTime);
        this.setBackTime(nextTime);
    }
    Flipper.prototype.setFrontTime = function (time) {
        this.frontNode.dataset.number = time;
    };
    Flipper.prototype.setBackTime = function (time) {
        this.backNode.dataset.number = time;
    };
    Flipper.prototype.flipDown = function (currentTime, nextTime) {
        var _this = this;
        if (this.isFlipping) {
            return false;
        }
        this.isFlipping = true;
        this.setFrontTime(currentTime);
        this.setBackTime(nextTime);
        this.flipNode.classList.add("running");
        setTimeout(function () {
            _this.flipNode.classList.remove("running");
            _this.isFlipping = false;
            _this.setFrontTime(nextTime);
        }, this.duration);
    };
    return Flipper;
}());

var getTimeFromDate = function (date) {
    return date
        .toTimeString()
        .slice(0, 8)
        .split(":")
        .join("");
};

var flips = document.querySelectorAll(".flip");
var now = new Date();
var nowTimeStr = getTimeFromDate(new Date(now.getTime() - 1000));
var nextTimeStr = getTimeFromDate(now);
var flippers = Array.from(flips).map(function (flip, i) { return new Flipper(flip, nowTimeStr[i], nextTimeStr[i]); });
setInterval(function () {
    var now = new Date();
    var nowTimeStr = getTimeFromDate(new Date(now.getTime() - 1000));
    var nextTimeStr = getTimeFromDate(now);
    for (var i = 0; i < flippers.length; i++) {
        if (nowTimeStr[i] === nextTimeStr[i]) {
            continue;
        }
        flippers[i].flipDown(nowTimeStr[i], nextTimeStr[i]);
    }
}, 1000);

// 当窗口失去焦点时，修改标题提示用户回来
window.onblur = function () {
    document.title = "你快回来~";
};

// 当窗口重新获得焦点时，恢复标题
window.onfocus = function () {
    document.title = "早上好中午好晚上好~";
};

// 页面加载完成后，设置背景图并启动时间更新
window.onload = function () {
    setBackground(); // 设置背景图片
    setInterval(updateTime, 1000); // 每隔1秒更新一次时间
    updateTime(); // 初始调用以确保页面载入时立即显示当前时间
};
