//1. 判断是否为移动端

function isMobile() {
    return function isMobile() {
        return /Mobi|Android|iPhone/i.test(navigator.userAgent);
    }
}

//2.获取元素距离页面顶部的距离
function getOffsetTop(el)
{
    let offset = 0;
    while (el) {
        offset += el.offsetTop;
        el = el.offsetParent;
    }
    return offset;
}
//3.防抖函数debounce
function debounce(fn, delay = 300)
{
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
//4.节流函数throttle
function throttle(fn, delay = 300)
{
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last > delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}
//5.复制文本到剪贴板
function copyToClipboard(text)
{
    navigator.clipboard.writeText(text);
}
//6.平滑滚动到页面顶部
function scrollToTop()
{
    window.scrollTo({top: 0, behavior: 'smooth'});
}
//7.判断对象是否为空
function isEmptyObject(obj)
{
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
//8.数组去重
function unique(arr)
{
    return [...new Set(arr)];
}
//9.生成随机颜色
function randomColor()
{
    return `#${Math.random().toString(16).slice(2, 8)}`;
}
//10.获取URL查询参数
function getQueryParam(name)
{
    return new URLSearchParams(window.location.search).get(name);
}
//11.判断是否为闰年
function isLeapYear(year)
{
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
//12.数组乱序（洗牌算法）
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

//13.获取cookie
function getCookie(name)
{
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
//14.设置cookie
function setCookie(name, value, days = 7)
{
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}
//15.删除cookie
function deleteCookie(name)
{
    setCookie(name, '', -1);
}

//16.判断元素是否在可视区域
function isInViewport(el)
{
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
}
//17.获取当前时间字符串
function getTimeString()
{
    return new Date().toLocaleString();
}
//18.监听元素尺寸变化（ResizeObserver）
const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        console.log('size changed:', entry.contentRect);
    }
});
ro.observe(document.querySelector('#app'));

//19.判断浏览器类型
function getBrowser()
{
    const ua = navigator.userAgent;
    if (/chrome/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua)) return 'Safari';
    if (/msie|trident/i.test(ua)) return 'IE';
    return 'Unknown';
}
//20.监听页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面不可见');
    } else {
        console.log('页面可见');
    }
});
//21.判断图片是否加载完成
function isImageLoaded(img)
{
    return img.complete && img.naturalWidth !== 0;
}
//22.获取元素样式
function getStyle(el, prop)
{
    return window.getComputedStyle(el)[prop];
}
//23.监听粘贴事件并获取内容
document.addEventListener('paste', e => {
    const text = e.clipboardData.getData('text');
    console.log('粘贴内容：', text);
});
//24.判断字符串是否为JSON
function isJSON(str)
{
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}
//25.生成指定范围的随机整数
function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//26.监听窗口尺寸变化
window.addEventListener('resize', () => {
    console.log('窗口尺寸变化:', window.innerWidth, window.innerHeight);
});

//27.判断邮箱格式
function isEmail(str)
{
    return /^[\w.-]+@[\w.-]+\.\w+$/.test(str);
}
//28.判断手机号格式（中国）
function isPhone(str) {
    return /^1[3-9]\d{9}$/.test(str);
}

//29.计算两个日期相差天数
function diffDays(date1, date2)
{
    const t1 = new Date(date1).getTime();
    const t2 = new Date(date2).getTime();
    return Math.abs(Math.floor((t2 - t1) / (24 * 3600 * 1000)));
}
//30.监听键盘按键
document.addEventListener('keydown', e => {
    console.log('按下了：', e.key);
});
//31.获取页面滚动距离
function getScrollTop()
{
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
}
//32.判断是否为数字
function isNumber(val)
{
    return typeof val === 'number' && !isNaN(val);
}
//33.生成唯一ID（时间戳 + 随机数）
function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

//34.监听鼠标右键菜单
document.addEventListener('contextmenu', e => {
    e.preventDefault();
    console.log('右键菜单被触发');
});
//35.判断是否为函数
function isFunction(val)
{
    return typeof val === 'function';
}
//36.获取本地存储localStorage
function getLocal(key)
{
    return localStorage.getItem(key);
}
//37.设置本地存储localStorage
function setLocal(key, value)
{
    localStorage.setItem(key, value);
}
//38.删除本地存储localStorage
function removeLocal(key)
{
    localStorage.removeItem(key);
}
//39.判断是否为Promise
function isPromise(obj)
{
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
//40.获取当前页面路径
function getPath()
{
    return window.location.pathname;
}
//41.监听剪贴板复制事件
document.addEventListener('copy', e => {
    console.log('内容已复制到剪贴板');
});
//42.判断是否为数组
function isArray(val)
{
    return Array.isArray(val);
}
//43.获取元素宽高
function getSize(el)
{
    return {width: el.offsetWidth, height: el.offsetHeight};
}
//44.判断是否为布尔值
function isBoolean(val)
{
    return typeof val === 'boolean';
}
//45.监听页面滚动事件
window.addEventListener('scroll', () => {
    console.log('页面滚动了');
});
//46.判断是否为对象
function isObject(val)
{
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}
//47.获取当前域名
function getHost()
{
    return window.location.host;
}
//48.判断是否为空字符串
function isEmptyString(str)
{
    return typeof str === 'string' && str.trim() === '';
}
//49.监听窗口获得 / 失去焦点
window.addEventListener('focus', () => console.log('获得焦点'));
window.addEventListener('blur', () => console.log('失去焦点'));
//50.判断是否为DOM元素
function isElement(obj)
{
    return obj instanceof Element;
}