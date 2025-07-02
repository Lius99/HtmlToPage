/**
 * HTML代码可视化编辑器
 * 作者: AI Assistant
 * 功能: 双向交互的HTML编辑器，支持实时预览和可视化编辑
 */

class HTMLVisualEditor {
    constructor() {
        this.editor = null;
        this.previewFrame = null;
        this.currentEditElement = null;
        this.elementMap = new Map(); // 存储元素与代码位置的映射
        this.isPreviewMode = false;
        this.lastSavedContent = '';
        this.fileManagerUI = null;
        this.visualEditingEnabled = true; // 初始化可视化编辑状态
        this.notificationQueue = []; // 通知队列
        
        // 默认HTML模板
        this.defaultHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMLPro - 可视化HTML编辑器</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        /* 背景动画 */
        .bg-animation {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1;
            background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
            overflow: hidden;
        }
        
        .bg-animation::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            background: radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%);
            animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
            to { transform: rotate(360deg); }
        }
        
        /* 主容器 */
        .hero-container {
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 20px;
            z-index: 1;
        }
        
        /* 头部 */
        .hero-header {
            text-align: center;
            margin-bottom: 60px;
            animation: fadeInDown 0.8s ease;
        }
        
        .logo-container {
            display: inline-flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
            box-shadow: 0 10px 30px rgba(88, 166, 255, 0.3);
            animation: pulse 2s ease infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        h1 {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 20px;
            color: #8b949e;
            margin-top: 10px;
        }
        
        /* 功能卡片 */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
        .feature-card {
            background: rgba(22, 27, 34, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(48, 54, 61, 0.5);
            border-radius: 16px;
            padding: 30px;
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease backwards;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #58a6ff, transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        
        .feature-card:hover::before {
            transform: translateX(100%);
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: rgba(88, 166, 255, 0.3);
            box-shadow: 0 10px 40px rgba(88, 166, 255, 0.2);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px rgba(88, 166, 255, 0.3);
        }
        
        .feature-title {
            font-size: 20px;
            font-weight: 600;
            color: #f0f6fc;
            margin-bottom: 10px;
        }
        
        .feature-desc {
            font-size: 16px;
            color: #8b949e;
            line-height: 1.6;
        }
        
        /* 演示区域 */
        .demo-section {
            background: rgba(22, 27, 34, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(48, 54, 61, 0.5);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 40px;
            animation: fadeIn 1s ease backwards;
            animation-delay: 0.5s;
        }
        
        .demo-title {
            font-size: 24px;
            font-weight: 600;
            color: #f0f6fc;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .demo-content {
            display: flex;
            gap: 30px;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .demo-item {
            text-align: center;
        }
        
        .demo-button {
            background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(88, 166, 255, 0.3);
            margin: 10px;
        }
        
        .demo-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(88, 166, 255, 0.4);
        }
        
        .demo-button.secondary {
            background: rgba(88, 166, 255, 0.1);
            border: 1px solid #58a6ff;
            color: #58a6ff;
        }
        
        .demo-button.secondary:hover {
            background: rgba(88, 166, 255, 0.2);
        }
        
        /* 代码示例 */
        .code-example {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
        }
        
        .code-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #30363d;
        }
        
        .code-lang {
            background: #58a6ff;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .code-content {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.6;
            color: #e6edf3;
        }
        
        .code-content .tag { color: #7ee787; }
        .code-content .attr { color: #79c0ff; }
        .code-content .value { color: #a5d6ff; }
        .code-content .comment { color: #8b949e; }
        
        /* 底部CTA */
        .cta-section {
            text-align: center;
            margin-top: 60px;
            animation: fadeIn 1s ease backwards;
            animation-delay: 0.8s;
        }
        
        .cta-text {
            font-size: 18px;
            color: #8b949e;
            margin-bottom: 30px;
        }
        
        /* 动画 */
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* 响应式 */
        @media (max-width: 768px) {
            h1 { font-size: 36px; }
            .subtitle { font-size: 18px; }
            .features-grid { grid-template-columns: 1fr; }
            .demo-content { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>
    
    <div class="hero-container">
        <header class="hero-header">
            <div class="logo-container">
                <div class="logo">
                    <i class="fas fa-code"></i>
                </div>
                <h1>HTMLPro</h1>
            </div>
            <p class="subtitle">强大的可视化HTML编辑器 - 让网页开发更简单</p>
        </header>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <h3 class="feature-title">实时预览</h3>
                <p class="feature-desc">代码编辑与预览同步更新，所见即所得的开发体验</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-mouse-pointer"></i>
                </div>
                <h3 class="feature-title">可视化编辑</h3>
                <p class="feature-desc">点击预览区域的元素，直接定位并编辑对应代码</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-palette"></i>
                </div>
                <h3 class="feature-title">样式编辑器</h3>
                <p class="feature-desc">双击元素打开浮动面板，轻松调整样式和内容</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3 class="feature-title">响应式预览</h3>
                <p class="feature-desc">一键切换桌面、平板、手机视图，完美适配各种设备</p>
            </div>
        </div>
        
        <div class="demo-section">
            <h2 class="demo-title">🎯 试试这些功能</h2>
            <div class="demo-content">
                <div class="demo-item">
                    <button class="demo-button" onclick="this.textContent='已点击！'; this.style.background='linear-gradient(135deg, #28a745 0%, #20c997 100%)'">
                        <i class="fas fa-hand-pointer"></i> 点击我试试
                    </button>
                    <p style="margin-top: 10px; font-size: 14px; color: #8b949e;">点击按钮看看效果</p>
                </div>
                
                <div class="demo-item">
                    <button class="demo-button secondary" ondblclick="this.textContent='双击成功！'; this.style.borderColor='#28a745'; this.style.color='#28a745'">
                        <i class="fas fa-edit"></i> 双击编辑
                    </button>
                    <p style="margin-top: 10px; font-size: 14px; color: #8b949e;">双击打开编辑面板</p>
                </div>
            </div>
        </div>
        
        <div class="code-example">
            <div class="code-header">
                <span class="code-lang">HTML</span>
                <span style="color: #8b949e; font-size: 14px;">示例代码 - 修改试试看！</span>
            </div>
            <pre class="code-content"><span class="comment">&lt;!-- 修改这段代码，右侧会实时更新 --&gt;</span>
<span class="tag">&lt;div</span> <span class="attr">class</span>=<span class="value">"my-element"</span> <span class="attr">style</span>=<span class="value">"padding: 20px; background: #1e2329; border-radius: 8px;"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;h3</span> <span class="attr">style</span>=<span class="value">"color: #58a6ff;"</span><span class="tag">&gt;</span>Hello HTMLPro!<span class="tag">&lt;/h3&gt;</span>
    <span class="tag">&lt;p</span> <span class="attr">style</span>=<span class="value">"color: #c9d1d9;"</span><span class="tag">&gt;</span>开始编辑这段文字...<span class="tag">&lt;/p&gt;</span>
<span class="tag">&lt;/div&gt;</span></pre>
        </div>
        
        <div class="cta-section">
            <p class="cta-text">准备好开始创建精美的网页了吗？</p>
            <button class="demo-button" onclick="alert('开始使用 HTMLPro！\\n\\n提示：\\n- 在左侧编辑代码\\n- 右侧实时预览\\n- 点击元素定位代码\\n- 双击元素可视化编辑')">
                <i class="fas fa-rocket"></i> 开始创建
            </button>
            <button class="demo-button secondary" onclick="window.open('https://developer.mozilla.org/zh-CN/docs/Web/HTML', '_blank')">
                <i class="fas fa-book"></i> 学习更多
            </button>
        </div>
    </div>
    
    <script>
        // 添加一些交互效果
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.background = 'rgba(22, 27, 34, 0.9)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = 'rgba(22, 27, 34, 0.8)';
            });
        });
        
        // 代码高亮动画
        const codeContent = document.querySelector('.code-content');
        codeContent.addEventListener('mouseenter', () => {
            codeContent.style.background = '#161b22';
        });
        codeContent.addEventListener('mouseleave', () => {
            codeContent.style.background = '#0d1117';
        });
    </script>
</body>
</html>`;

        this.init();
    }

    // 初始化编辑器
    async init() {
        try {
            await this.initMonacoEditor();
            this.initPreviewFrame();
            this.bindEvents();
            this.initResizer();
            this.initFileManager();
            this.updatePreview();
            this.updateStatus('编辑器已就绪');
        } catch (error) {
            console.error('编辑器初始化失败:', error);
            this.updateStatus('编辑器初始化失败');
        }
    }

    // 初始化文件管理器
    initFileManager() {
        this.fileManagerUI = new FileManagerUI(this);
    }

    // 初始化Monaco编辑器
    async initMonacoEditor() {
        return new Promise((resolve, reject) => {
            require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
            
            require(['vs/editor/editor.main'], () => {
                try {
                    // 设置HTML语言配置
                    monaco.languages.html.htmlDefaults.setOptions({
                        format: {
                            tabSize: 2,
                            insertSpaces: true,
                            wrapLineLength: 120,
                            unformatted: 'default, br',
                            contentUnformatted: 'pre,code,textarea',
                            indentInnerHtml: false,
                            preserveNewLines: true,
                            maxPreserveNewLines: 2,
                            indentHandlebars: false,
                            endWithNewline: false,
                            extraLiners: 'head, body, /html',
                            wrapAttributes: 'auto'
                        },
                        suggest: {
                            html5: true,
                            angular1: false,
                            ionic: false
                        }
                    });

                    // 创建编辑器实例
                    this.editor = monaco.editor.create(document.getElementById('editorContainer'), {
                        value: this.defaultHTML,
                        language: 'html',
                        theme: 'vs-dark',
                        automaticLayout: true,
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        minimap: {
                            enabled: true
                        },
                        wordWrap: 'off',
                        folding: true,
                        links: true,
                        colorDecorators: true,
                        contextmenu: true,
                        mouseWheelZoom: true,
                        formatOnPaste: true,
                        formatOnType: true,
                        autoIndent: 'advanced',
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: true,
                        parameterHints: {
                            enabled: true
                        }
                    });

                    // 监听内容变化
                    this.editor.onDidChangeModelContent(() => {
                        this.debounce(() => {
                            this.updatePreview();
                            this.updateDocumentStats();
                        }, 500)();
                    });

                    // 监听光标位置变化
                    this.editor.onDidChangeCursorPosition((e) => {
                        this.updateCursorPosition(e.position);
                    });

                    this.lastSavedContent = this.editor.getValue();
                    this.updateDocumentStats();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // 初始化预览框架
    initPreviewFrame() {
        this.previewFrame = document.getElementById('previewFrame');
        
        // 监听预览框架加载完成
        this.previewFrame.onload = () => {
            this.setupPreviewInteraction();
        };
    }

    // 设置预览交互
    setupPreviewInteraction() {
        // 延迟一小段时间确保iframe完全加载
        setTimeout(() => {
            try {
                const previewDoc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
                
                if (!previewDoc) {
                    console.warn('无法访问预览文档');
                    return;
                }

                // 清除之前的事件监听器
                this.clearPreviewEventListeners();
                
                // 添加点击事件监听
                this.previewClickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePreviewClick(e);
                };
                
                this.previewDblClickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePreviewDoubleClick(e);
                };
                
                this.previewMouseOverHandler = (e) => {
                    e.stopPropagation();
                    this.handlePreviewHover(e);
                };
                
                this.previewMouseOutHandler = (e) => {
                    e.stopPropagation();
                    this.clearPreviewHighlight();
                };

                previewDoc.addEventListener('click', this.previewClickHandler, true);
                previewDoc.addEventListener('dblclick', this.previewDblClickHandler, true);
                previewDoc.addEventListener('mouseover', this.previewMouseOverHandler, true);
                previewDoc.addEventListener('mouseout', this.previewMouseOutHandler, true);

                // 注入样式和脚本用于高亮和交互
                this.injectPreviewStyles(previewDoc);
                this.injectPreviewScript(previewDoc);
                
                console.log('预览交互设置成功');
                this.updateStatus('预览交互已激活');

            } catch (error) {
                console.warn('预览交互设置失败:', error);
                this.updateStatus('预览交互设置失败，请刷新预览');
            }
        }, 100);
    }

    // 清除预览事件监听器
    clearPreviewEventListeners() {
        try {
            const previewDoc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
            if (previewDoc && this.previewClickHandler) {
                previewDoc.removeEventListener('click', this.previewClickHandler, true);
                previewDoc.removeEventListener('dblclick', this.previewDblClickHandler, true);
                previewDoc.removeEventListener('mouseover', this.previewMouseOverHandler, true);
                previewDoc.removeEventListener('mouseout', this.previewMouseOutHandler, true);
            }
        } catch (error) {
            // 忽略清理错误
        }
    }

    // 注入预览样式
    injectPreviewStyles(previewDoc) {
        // 移除之前的样式
        const existingStyle = previewDoc.getElementById('editor-interaction-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = previewDoc.createElement('style');
        style.id = 'editor-interaction-styles';
        style.textContent = `
            .editor-highlight {
                outline: 2px solid #007acc;
                outline-offset: 2px;
                background: rgba(0, 122, 204, 0.1);
                cursor: pointer;
                position: relative;
                z-index: 9999;
            }
            .editor-highlight:hover {
                outline-color: #1a86d1;
                background: rgba(0, 122, 204, 0.2);
            }
            .editor-element-indicator {
                position: absolute;
                top: -25px;
                left: 0;
                background: #007acc;
                color: white;
                padding: 2px 8px;
                font-size: 12px;
                border-radius: 3px;
                pointer-events: none;
                z-index: 10000;
                font-family: monospace;
            }
        `;
        previewDoc.head.appendChild(style);
    }

    // 注入预览脚本
    injectPreviewScript(previewDoc) {
        const existingScript = previewDoc.getElementById('editor-interaction-script');
        if (existingScript) {
            existingScript.remove();
        }

        const script = previewDoc.createElement('script');
        script.id = 'editor-interaction-script';
        script.textContent = `
            (function() {
                // 为每个元素添加data-editor-id
                function addEditorIds() {
                    const allElements = document.querySelectorAll('*');
                    allElements.forEach((el, index) => {
                        if (!el.dataset.editorId) {
                            el.dataset.editorId = 'element-' + index;
                        }
                    });
                }
                
                // 立即执行
                addEditorIds();
                
                // 监听DOM变化，自动为新元素添加ID
                if (window.MutationObserver) {
                    const observer = new MutationObserver(function(mutations) {
                        addEditorIds();
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
                
                // 标记文档已经注入了脚本
                window.__editorScriptInjected = true;
            })();
        `;
        previewDoc.head.appendChild(script);
    }

    // 处理预览区域点击
    handlePreviewClick(e) {
        // 如果可视化编辑被禁用，直接返回
        if (!this.visualEditingEnabled) return;
        
        const element = e.target;
        if (!element || element === document || element.tagName === 'HTML' || element.tagName === 'BODY') {
            return;
        }

        // 高亮选中的元素
        this.clearPreviewHighlight();
        element.classList.add('editor-highlight');

        // 打开悬浮编辑面板
        this.openFloatingEditor(element);
        
        // 定位到代码中的对应位置
        this.locateElementInCode(element);
    }

    // 处理预览区域双击
    handlePreviewDoubleClick(e) {
        // 如果可视化编辑被禁用，直接返回
        if (!this.visualEditingEnabled) return;
        
        const element = e.target;
        if (!element || element === document || element.tagName === 'HTML' || element.tagName === 'BODY') {
            return;
        }

        console.log('双击编辑元素:', element.tagName, element.textContent?.substring(0, 50));
        
        // 高亮当前编辑的元素
        this.clearPreviewHighlight();
        element.classList.add('editor-highlight');
        
        // 使用悬浮编辑面板替代旧的编辑器
        this.openFloatingEditor(element);
        
        // 阻止事件冒泡，避免触发点击事件
        e.stopPropagation();
        e.preventDefault();
    }

    // 处理预览区域悬停
    handlePreviewHover(e) {
        // 如果可视化编辑被禁用，直接返回
        if (!this.visualEditingEnabled) return;
        
        const element = e.target;
        if (!element || element === document) return;

        // 清除之前的高亮
        this.clearPreviewHighlight();
        
        // 添加悬停高亮
        element.classList.add('editor-highlight');
    }

    // 清除预览高亮
    clearPreviewHighlight() {
        try {
            const previewDoc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
            
            // 查找所有可能有高亮的元素
            const allElements = previewDoc.querySelectorAll('*');
            allElements.forEach(el => {
                // 移除高亮类
                if (el.classList.contains('editor-highlight')) {
                    el.classList.remove('editor-highlight');
                }
                
                // 检查并移除可能的内联样式
                if (el.style) {
                    // 检查是否有编辑器相关的样式
                    const bgColor = el.style.backgroundColor || el.style.background;
                    const outline = el.style.outline;
                    
                    // 如果背景色是编辑器的高亮色，移除它
                    if (bgColor && (bgColor.includes('rgba(0, 122, 204') || bgColor.includes('rgb(0, 122, 204'))) {
                        el.style.removeProperty('background');
                        el.style.removeProperty('background-color');
                    }
                    
                    // 如果轮廓是编辑器的高亮色，移除它
                    if (outline && outline.includes('#007acc')) {
                        el.style.removeProperty('outline');
                        el.style.removeProperty('outline-offset');
                    }
                    
                    // 移除其他可能的编辑器样式
                    if (el.style.position === 'relative' && el.style.zIndex === '9999') {
                        el.style.removeProperty('position');
                        el.style.removeProperty('z-index');
                    }
                    
                    if (el.style.cursor === 'pointer') {
                        el.style.removeProperty('cursor');
                    }
                }
            });
            
            // 移除所有元素指示器
            const indicators = previewDoc.querySelectorAll('.editor-element-indicator');
            indicators.forEach(indicator => indicator.remove());
            
        } catch (error) {
            // 忽略跨域错误
            console.warn('清除高亮时出错:', error);
        }
    }

    // 在代码中定位元素 - 使用新的精确定位器
    locateElementInCode(element) {
        if (!window.ElementLocator) {
            console.error('元素定位器未加载');
            return;
        }

        try {
            // 获取元素标识信息
            const elementInfo = window.ElementLocator.getElementIdentifier(element);
            
            console.log('定位元素:', {
                tagName: elementInfo.tagName,
                id: elementInfo.id,
                className: elementInfo.className,
                directText: elementInfo.directText,
                parentInfo: elementInfo.parentInfo
            });

            // 获取当前代码
            const code = this.editor.getValue();
            
            // 使用新的定位器查找元素
            const location = window.ElementLocator.findElement(elementInfo, code);
            
            if (location) {
                console.log('找到元素位置:', {
                    行号: location.line,
                    列号: location.column,
                    置信度: location.confidence,
                    匹配详情: location.matchDetails
                });
                
                // 跳转到匹配位置
                this.editor.setPosition({
                    lineNumber: location.line,
                    column: location.column
                });
                
                // 清除之前的装饰
                if (this.currentDecorations) {
                    this.editor.deltaDecorations(this.currentDecorations, []);
                }
                
                // 高亮匹配的行
                const range = {
                    startLineNumber: location.line,
                    startColumn: location.column,
                    endLineNumber: location.line,
                    endColumn: location.column + 50 // 高亮一部分
                };
                
                this.currentDecorations = this.editor.deltaDecorations([], [{
                    range: range,
                    options: {
                        isWholeLine: false,
                        className: 'line-highlight',
                        inlineClassName: 'element-highlight-inline'
                    }
                }]);

                // 确保可见
                this.editor.revealLineInCenter(location.line);
                
                // 添加元素指示器到预览
                this.addElementIndicator(element, elementInfo.tagName);
                
                // 保存位置信息到元素（供后续更新使用）
                element.dataset.editorLine = location.line;
                element.dataset.editorColumn = location.column;
                element.dataset.editorConfidence = location.confidence;
                
                this.updateStatus(`已定位到 <${elementInfo.tagName}> 元素 (置信度: ${location.confidence})`);
            } else {
                this.updateStatus(`未能定位 <${elementInfo.tagName}> 元素`);
                console.warn('元素定位失败');
            }
        } catch (error) {
            console.error('定位元素失败:', error);
            this.updateStatus('定位元素失败: ' + error.message);
        }
    }

    // 构建搜索策略
    buildSearchStrategies(element) {
        const tagName = element.tagName.toLowerCase();
        const textContent = element.textContent?.trim();
        const id = element.id;
        const className = element.className;
        const strategies = [];

        // 策略1: 使用ID（最精确）
        if (id) {
            strategies.push({
                name: 'ID匹配',
                pattern: `<${tagName}[^>]*id=["']${this.escapeRegex(id)}["'][^>]*>`,
                useRegex: true
            });
        }

        // 策略2: 使用第一个类名
        if (className && typeof className === 'string' && className.trim()) {
            const firstClass = className.trim().split(/\s+/)[0];
            strategies.push({
                name: '类名匹配',
                pattern: `<${tagName}[^>]*class=["'][^"']*\\b${this.escapeRegex(firstClass)}\\b[^"']*["'][^>]*>`,
                useRegex: true
            });
        }

        // 策略3: 使用直接文本内容（仅限短文本且是直接子文本节点）
        if (textContent && textContent.length > 0 && textContent.length < 100) {
            const directText = this.getDirectTextContent(element);
            if (directText && directText.trim().length > 0) {
                const escapedText = this.escapeRegex(directText.trim());
                strategies.push({
                    name: '文本内容匹配',
                    pattern: `<${tagName}[^>]*>\\s*${escapedText}\\s*</${tagName}>`,
                    useRegex: true
                });
            }
        }

        // 策略4: 使用特定属性
        const uniqueAttrs = this.getUniqueAttributes(element);
        if (uniqueAttrs.length > 0) {
            const attrPattern = uniqueAttrs.map(attr => 
                `${attr.name}=["']${this.escapeRegex(attr.value)}["']`
            ).join('[^>]*');
            strategies.push({
                name: '属性匹配',
                pattern: `<${tagName}[^>]*${attrPattern}[^>]*>`,
                useRegex: true
            });
        }

        // 策略5: 只使用标签名（最后的选择）
        strategies.push({
            name: '标签匹配',
            pattern: `<${tagName}`,
            useRegex: false
        });

        return strategies;
    }

    // 获取元素的直接文本内容（不包括子元素的文本）
    getDirectTextContent(element) {
        let directText = '';
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                directText += node.textContent;
            }
        }
        return directText.trim();
    }

    // 获取唯一属性
    getUniqueAttributes(element) {
        const uniqueAttrs = [];
        const commonAttrs = ['class', 'id', 'style']; // 已经在其他策略中处理
        
        for (const attr of element.attributes) {
            if (!commonAttrs.includes(attr.name) && 
                attr.value && 
                attr.value.length > 0 && 
                attr.value.length < 50) {
                uniqueAttrs.push({
                    name: attr.name,
                    value: attr.value
                });
            }
        }
        
        return uniqueAttrs.slice(0, 2); // 最多使用两个属性
    }

    // 转义正则表达式特殊字符
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 添加元素指示器
    addElementIndicator(element, tagName) {
        try {
            const previewDoc = this.previewFrame.contentDocument;
            if (!previewDoc) return;

            // 移除之前的指示器
            const existingIndicators = previewDoc.querySelectorAll('.editor-element-indicator');
            existingIndicators.forEach(indicator => indicator.remove());

            // 添加新的指示器
            const indicator = previewDoc.createElement('div');
            indicator.className = 'editor-element-indicator';
            indicator.textContent = `<${tagName}>`;
            
            element.style.position = 'relative';
            element.appendChild(indicator);

            // 3秒后移除指示器
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
            }, 3000);
        } catch (error) {
            console.warn('添加元素指示器失败:', error);
        }
    }

    // 打开元素编辑器
    openElementEditor(element) {
        this.currentEditElement = element;
        
        const modal = document.getElementById('editModal');
        const tagInput = document.getElementById('elementTag');
        const textInput = document.getElementById('elementText');
        const attrsInput = document.getElementById('elementAttrs');

        if (!modal || !tagInput || !textInput || !attrsInput) {
            console.error('编辑器模态框元素未找到');
            this.updateStatus('编辑器界面错误');
            return;
        }

        try {
            // 填充当前元素信息
            tagInput.value = element.tagName.toLowerCase();
            
            // 获取直接文本内容（不包括子元素文本）
            const directText = this.getDirectTextContent(element);
            textInput.value = directText || element.textContent || '';
            
            // 保存原始信息用于查找
            this.originalElementInfo = {
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                className: element.className,
                text: directText || element.textContent || ''
            };
            
            // 获取元素属性（排除一些自动生成的属性）
            const attrs = [];
            const excludeAttrs = ['data-editor-id']; // 不排除class，我们需要它来定位
            
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                if (!excludeAttrs.includes(attr.name) && 
                    !attr.name.startsWith('data-')) {
                    if (attr.name === 'class') {
                        // 清理class中的高亮类
                        const cleanedClasses = attr.value
                            .split(' ')
                            .filter(cls => !cls.includes('editor-highlight'))
                            .join(' ')
                            .trim();
                        if (cleanedClasses) {
                            attrs.push(`${attr.name}="${cleanedClasses}"`);
                        }
                    } else {
                        attrs.push(`${attr.name}="${attr.value}"`);
                    }
                }
            }
            
            attrsInput.value = attrs.join(' ');

            console.log('打开编辑器 - 元素信息:', {
                tag: element.tagName.toLowerCase(),
                text: directText,
                attrs: attrs.join(' '),
                originalInfo: this.originalElementInfo
            });

            // 显示模态框
            modal.style.display = 'flex';
            
            // 延迟聚焦，确保模态框完全显示
            setTimeout(() => {
                textInput.focus();
                textInput.select();
            }, 100);
            
            this.updateStatus(`正在编辑 <${element.tagName.toLowerCase()}> 元素`);
            
        } catch (error) {
            console.error('打开编辑器失败:', error);
            this.updateStatus('打开编辑器失败: ' + error.message);
        }
    }

    // 保存元素修改
    saveElementChanges() {
        if (!this.currentEditElement) {
            console.error('没有正在编辑的元素');
            return;
        }

        const textInput = document.getElementById('elementText');
        const attrsInput = document.getElementById('elementAttrs');
        
        if (!textInput || !attrsInput) {
            console.error('找不到输入框元素');
            return;
        }
        
        const newText = textInput.value;
        const newAttrs = attrsInput.value.trim();

        console.log('保存元素修改:', {
            element: this.currentEditElement.tagName,
            newText: newText.substring(0, 50),
            newAttrs
        });

        // 在代码中查找并替换元素
        const updateSuccess = this.updateElementInCode(this.currentEditElement, newText, newAttrs);
        
        if (updateSuccess) {
            // 关闭模态框
            this.closeElementEditor();
            
            // 不要立即更新预览，让updateElementInCode中的延迟更新生效
            this.updateStatus('元素已更新，正在同步...');
        } else {
            this.updateStatus('更新失败，请手动修改代码');
        }
    }

    // 在代码中更新元素
    updateElementInCode(element, newText, newAttrs) {
        const tagName = element.tagName.toLowerCase();
        const currentText = this.getDirectTextContent(element) || element.textContent || '';
        
        console.log('更新元素代码:', {
            tagName,
            currentText: currentText.substring(0, 50),
            newText: newText.substring(0, 50),
            newAttrs
        });
        
        try {
            const model = this.editor.getModel();
            const fullText = model.getValue();
            
            // 先尝试精确查找
            let elementStartPos = -1;
            let elementEndPos = -1;
            let foundMatch = false;
            
            // 使用简化的查找方法
            if (element.className && typeof element.className === 'string') {
                // 使用类名查找
                const cleanClasses = element.className
                    .split(' ')
                    .filter(cls => !cls.includes('editor-highlight'))
                    .join(' ')
                    .trim();
                    
                if (cleanClasses) {
                    const firstClass = cleanClasses.split(' ')[0];
                    // 查找包含该类名的标签
                    const classPattern = new RegExp(
                        `<${tagName}[^>]*class=["'][^"']*${this.escapeRegex(firstClass)}[^"']*["'][^>]*>`,
                        'i'
                    );
                    
                    const match = fullText.match(classPattern);
                    if (match) {
                        elementStartPos = match.index;
                        // 查找对应的结束标签
                        const afterStart = fullText.substring(elementStartPos);
                        const endPattern = new RegExp(`</${tagName}>`, 'i');
                        const endMatch = afterStart.match(endPattern);
                        
                        if (endMatch) {
                            elementEndPos = elementStartPos + afterStart.indexOf(endMatch[0]) + endMatch[0].length;
                            foundMatch = true;
                            console.log('通过类名找到元素');
                        }
                    }
                }
            }
            
            // 如果没找到，尝试使用ID
            if (!foundMatch && element.id) {
                const idPattern = new RegExp(
                    `<${tagName}[^>]*id=["']${this.escapeRegex(element.id)}["'][^>]*>`,
                    'i'
                );
                
                const match = fullText.match(idPattern);
                if (match) {
                    elementStartPos = match.index;
                    const afterStart = fullText.substring(elementStartPos);
                    const endPattern = new RegExp(`</${tagName}>`, 'i');
                    const endMatch = afterStart.match(endPattern);
                    
                    if (endMatch) {
                        elementEndPos = elementStartPos + afterStart.indexOf(endMatch[0]) + endMatch[0].length;
                        foundMatch = true;
                        console.log('通过ID找到元素');
                    }
                }
            }
            
            // 如果还没找到，使用文本内容
            if (!foundMatch && currentText) {
                const escapedText = this.escapeRegex(currentText.trim());
                const textPattern = new RegExp(
                    `<${tagName}[^>]*>\\s*${escapedText}\\s*</${tagName}>`,
                    'i'
                );
                
                const match = fullText.match(textPattern);
                if (match) {
                    elementStartPos = match.index;
                    elementEndPos = elementStartPos + match[0].length;
                    foundMatch = true;
                    console.log('通过文本内容找到元素');
                }
            }
            
            if (foundMatch && elementStartPos !== -1 && elementEndPos !== -1) {
                // 构建新的元素HTML
                let newElementHTML;
                const isVoidElement = this.isVoidElement(tagName);
                
                if (isVoidElement) {
                    if (newAttrs.trim()) {
                        newElementHTML = `<${tagName} ${newAttrs} />`;
                    } else {
                        newElementHTML = `<${tagName} />`;
                    }
                } else {
                    if (newAttrs.trim()) {
                        newElementHTML = `<${tagName} ${newAttrs}>${newText}</${tagName}>`;
                    } else {
                        newElementHTML = `<${tagName}>${newText}</${tagName}>`;
                    }
                }
                
                // 替换元素
                const beforeElement = fullText.substring(0, elementStartPos);
                const afterElement = fullText.substring(elementEndPos);
                const newFullText = beforeElement + newElementHTML + afterElement;
                
                // 更新编辑器内容
                model.setValue(newFullText);
                console.log('代码更新成功');
                this.updateStatus('元素已更新并同步到代码');
                
                // 延迟更新预览
                setTimeout(() => {
                    this.updatePreview();
                }, 300);
                
                return true;
                
            } else {
                console.warn('未能找到要更新的元素');
                this.updateStatus('未能在代码中找到对应元素');
                
                // 提供手动更新建议
                const suggestion = this.generateUpdateSuggestion(tagName, newText, newAttrs);
                console.log('建议的更新代码:', suggestion);
                alert('未能自动更新，请手动修改代码。\n建议的代码：\n' + suggestion);
                
                return false;
            }
            
        } catch (error) {
            console.error('更新代码失败:', error);
            this.updateStatus('更新代码失败: ' + error.message);
            return false;
        }
    }

    // 构建更新搜索策略
    buildUpdateSearchStrategies(element, currentText) {
        const tagName = element.tagName.toLowerCase();
        const id = element.id;
        const className = element.className;
        const strategies = [];

        // 策略1: 使用ID精确匹配
        if (id) {
            strategies.push({
                name: 'ID精确匹配',
                pattern: `<${tagName}[^>]*id=["']${this.escapeRegex(id)}["'][^>]*>([^<]*)</${tagName}>`,
                flags: 'i'
            });
        }

        // 策略2: 使用类名匹配
        if (className && typeof className === 'string') {
            const cleanClasses = className.split(' ')
                .filter(cls => !cls.includes('editor-highlight'))
                .join(' ');
            if (cleanClasses.trim()) {
                const firstClass = cleanClasses.trim().split(/\s+/)[0];
                strategies.push({
                    name: '类名匹配',
                    pattern: `<${tagName}[^>]*class=["'][^"']*\\b${this.escapeRegex(firstClass)}\\b[^"']*["'][^>]*>([^<]*)</${tagName}>`,
                    flags: 'i'
                });
            }
        }

        // 策略3: 使用文本内容匹配
        if (currentText && currentText.trim().length > 0 && currentText.length < 200) {
            const escapedText = this.escapeRegex(currentText.trim());
            strategies.push({
                name: '文本内容匹配',
                pattern: `<${tagName}[^>]*>\\s*${escapedText}\\s*</${tagName}>`,
                flags: 'i'
            });
        }

        // 策略4: 宽松的标签匹配（最后尝试）
        strategies.push({
            name: '标签匹配',
            pattern: `<${tagName}[^>]*>([^<]*)</${tagName}>`,
            flags: 'i'
        });

        return strategies;
    }

    // 检查是否为自闭合标签
    isVoidElement(tagName) {
        const voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
            'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
        ];
        return voidElements.includes(tagName.toLowerCase());
    }

    // 生成更新建议
    generateUpdateSuggestion(tagName, newText, newAttrs) {
        if (newAttrs.trim()) {
            return `<${tagName} ${newAttrs}>${newText}</${tagName}>`;
        } else {
            return `<${tagName}>${newText}</${tagName}>`;
        }
    }

    // 关闭元素编辑器
    closeElementEditor() {
        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
        this.currentEditElement = null;
    }

    // 打开悬浮编辑面板
    openFloatingEditor(element) {
        this.currentEditElement = element;
        const floatingEditor = document.getElementById('floatingEditor');
        
        if (!floatingEditor) {
            console.error('悬浮编辑面板未找到');
            return;
        }

        try {
            // 将面板位置设置在代码编辑区域右侧
            const panelWidth = 320; // 面板宽度
            const panelHeight = 600; // 面板估计高度
            const editorContainer = document.querySelector('.editor-container');
            const editorRect = editorContainer.getBoundingClientRect();
            
            // 计算位置：在编辑器右边缘内侧，距离右边缘20px
            const leftPosition = editorRect.right - panelWidth - 20;
            const topPosition = editorRect.top + 60; // 距离顶部60px，避开工具栏
            
            floatingEditor.style.left = Math.max(20, leftPosition) + 'px';
            floatingEditor.style.top = Math.max(20, topPosition) + 'px';
            floatingEditor.style.transform = 'none';
            
            // 填充元素信息
            this.populateFloatingEditor(element);
            
            // 显示悬浮面板
            floatingEditor.style.display = 'block';
            
            // 绑定悬浮面板事件（如果还没绑定）
            if (!this.floatingEditorBound) {
                this.bindFloatingEditorEvents();
                this.floatingEditorBound = true;
            }
            
            this.updateStatus(`正在编辑 <${element.tagName.toLowerCase()}> 元素`);
            
        } catch (error) {
            console.error('打开悬浮编辑面板失败:', error);
            this.updateStatus('打开悬浮编辑面板失败');
        }
    }

    // 填充悬浮编辑面板数据
    populateFloatingEditor(element) {
        const tagName = element.tagName.toLowerCase();
        
        // 更新标签信息
        document.getElementById('tagIcon').textContent = tagName.toUpperCase().substring(0, 2);
        document.getElementById('tagName').textContent = tagName;
        
        // 填充内容
        const directText = this.getDirectTextContent(element);
        document.getElementById('contentEditor').value = directText || element.textContent || '';
        
        // 获取计算样式
        let computedStyle = null;
        try {
            if (this.previewFrame.contentWindow && this.previewFrame.contentWindow.getComputedStyle) {
                computedStyle = this.previewFrame.contentWindow.getComputedStyle(element);
            }
        } catch (error) {
            console.warn('无法获取计算样式:', error);
        }
        
        if (computedStyle) {
            // 填充间距信息
            const marginTop = parseInt(computedStyle.marginTop) || 0;
            const marginLeft = parseInt(computedStyle.marginLeft) || 0;
            const paddingTop = parseInt(computedStyle.paddingTop) || 0;
            const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
            
            document.getElementById('marginV').value = marginTop;
            document.getElementById('marginH').value = marginLeft;
            document.getElementById('paddingV').value = paddingTop;
            document.getElementById('paddingH').value = paddingLeft;
            
            // 填充字体信息
            const fontSize = computedStyle.fontSize;
            const fontWeight = computedStyle.fontWeight;
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            const textAlign = computedStyle.textAlign;
            
            this.setSelectValue('fontSize', fontSize);
            this.setSelectValue('fontWeight', fontWeight);
            this.setColorValue(color);
            this.setBackgroundColorValue(backgroundColor);
            this.setAlignment(textAlign);
        }
        
        // 填充自定义CSS
        const style = element.getAttribute('style') || '';
        document.getElementById('customCSS').value = style;
    }

    // 设置下拉框值
    setSelectValue(selectId, value) {
        const select = document.getElementById(selectId);
        if (select && value) {
            // 查找匹配的选项
            for (let option of select.options) {
                if (option.value === value || option.text === value) {
                    select.value = option.value;
                    return;
                }
            }
            // 如果没找到匹配项，设置为默认值
            select.value = '';
        }
    }

    // 设置颜色值
    setColorValue(color) {
        const colorText = document.getElementById('colorText');
        const colorPreview = document.getElementById('colorPreview');
        const colorInput = document.getElementById('colorInput');
        
        if (color && color !== 'transparent') {
            colorText.value = color;
            colorPreview.style.backgroundColor = color;
            
            // 尝试转换为hex颜色
            try {
                const hexColor = this.rgbToHex(color);
                if (hexColor) {
                    colorInput.value = hexColor;
                }
            } catch (e) {
                // 忽略转换错误
            }
        } else {
            colorText.value = 'transparent';
            colorPreview.style.backgroundColor = 'transparent';
        }
    }

    // 设置背景颜色值
    setBackgroundColorValue(color) {
        const bgColorText = document.getElementById('bgColorText');
        const bgColorPreview = document.getElementById('bgColorPreview');
        const bgColorInput = document.getElementById('bgColorInput');
        
        if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
            bgColorText.value = color;
            bgColorPreview.style.backgroundColor = color;
            
            // 尝试转换为hex颜色
            try {
                const hexColor = this.rgbToHex(color);
                if (hexColor) {
                    bgColorInput.value = hexColor;
                }
            } catch (e) {
                // 忽略转换错误
            }
        } else {
            bgColorText.value = 'transparent';
            bgColorPreview.style.backgroundColor = 'transparent';
        }
    }

    // RGB转HEX
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        return null;
    }

    // 设置对齐方式
    setAlignment(textAlign) {
        const alignmentBtns = document.querySelectorAll('.alignment-btn');
        alignmentBtns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-align="${textAlign}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // 绑定悬浮编辑面板事件
    bindFloatingEditorEvents() {
        // 初始化拖动功能
        this.initFloatingEditorDrag();

        // 关闭按钮
        document.getElementById('floatingClose').addEventListener('click', () => {
            this.closeFloatingEditor();
        });

        // 高级设置切换
        document.getElementById('advancedToggle').addEventListener('click', () => {
            this.toggleAdvancedSettings();
        });

        // 文字颜色选择器
        document.getElementById('colorPreview').addEventListener('click', () => {
            document.getElementById('colorInput').click();
        });

        document.getElementById('colorInput').addEventListener('change', (e) => {
            const color = e.target.value;
            document.getElementById('colorPreview').style.backgroundColor = color;
            document.getElementById('colorText').value = color;
        });

        // 监听文本输入框的变化
        document.getElementById('colorText').addEventListener('input', (e) => {
            const color = e.target.value;
            if (color && color !== 'transparent') {
                document.getElementById('colorPreview').style.backgroundColor = color;
                // 尝试更新颜色选择器的值
                try {
                    if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
                        document.getElementById('colorInput').value = color;
                    }
                } catch (err) {
                    // 忽略无效颜色值
                }
            }
        });

        // 背景颜色选择器
        document.getElementById('bgColorPreview').addEventListener('click', () => {
            document.getElementById('bgColorInput').click();
        });

        document.getElementById('bgColorInput').addEventListener('change', (e) => {
            const color = e.target.value;
            document.getElementById('bgColorPreview').style.backgroundColor = color;
            document.getElementById('bgColorText').value = color;
        });

        // 监听背景颜色文本输入框的变化
        document.getElementById('bgColorText').addEventListener('input', (e) => {
            const color = e.target.value;
            if (color && color !== 'transparent') {
                document.getElementById('bgColorPreview').style.backgroundColor = color;
                // 尝试更新颜色选择器的值
                try {
                    if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
                        document.getElementById('bgColorInput').value = color;
                    }
                } catch (err) {
                    // 忽略无效颜色值
                }
            }
        });

        // 对齐按钮
        document.querySelectorAll('.alignment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.alignment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // 保存和放弃按钮
        document.getElementById('floatingSaveBtn').addEventListener('click', () => {
            this.saveFloatingEditorChanges();
        });

        document.getElementById('floatingDiscardBtn').addEventListener('click', () => {
            this.closeFloatingEditor();
        });
    }

    // 初始化悬浮编辑面板拖动功能
    initFloatingEditorDrag() {
        const floatingEditor = document.getElementById('floatingEditor');
        const header = document.querySelector('.floating-editor-header');
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        // 鼠标按下事件
        header.addEventListener('mousedown', (e) => {
            // 如果点击的是关闭按钮，不触发拖动
            if (e.target.id === 'floatingClose' || e.target.closest('#floatingClose')) return;
            
            isDragging = true;
            
            // 获取面板当前位置
            const rect = floatingEditor.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            // 记录鼠标起始位置
            startX = e.clientX;
            startY = e.clientY;
            
            // 设置面板为绝对定位
            floatingEditor.style.left = startLeft + 'px';
            floatingEditor.style.top = startTop + 'px';
            floatingEditor.style.transform = 'none';
            
            // 添加拖动时的样式
            floatingEditor.classList.add('dragging');
            header.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            
            // 防止文本选中和拖动图片等默认行为
            e.preventDefault();
            e.stopPropagation();
        });

        // 鼠标移动事件
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // 计算移动距离
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // 计算新位置
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // 获取面板尺寸
            const rect = floatingEditor.getBoundingClientRect();
            
            // 限制拖动范围
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - rect.width));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - rect.height));
            
            // 更新位置
            floatingEditor.style.left = newLeft + 'px';
            floatingEditor.style.top = newTop + 'px';
        };
        
        document.addEventListener('mousemove', handleMouseMove);

        // 鼠标释放事件
        const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // 恢复样式
            floatingEditor.classList.remove('dragging');
            header.style.cursor = 'grab';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        
        document.addEventListener('mouseup', handleMouseUp);
        
        // 设置初始鼠标样式
        header.style.cursor = 'grab';
        
        // 清理函数，避免内存泄漏
        floatingEditor.addEventListener('remove', () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        });
    }

    // 切换高级设置
    toggleAdvancedSettings() {
        const toggle = document.getElementById('advancedToggle');
        const content = document.getElementById('advancedContent');
        
        toggle.classList.toggle('expanded');
        if (toggle.classList.contains('expanded')) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }

    // 保存悬浮编辑器修改
    saveFloatingEditorChanges() {
        if (!this.currentEditElement) return;

        try {
            const element = this.currentEditElement;
            const newText = document.getElementById('contentEditor').value;
            
            // 收集样式更改
            const styles = {};
            
            // 间距
            const marginV = document.getElementById('marginV').value;
            const marginH = document.getElementById('marginH').value;
            const paddingV = document.getElementById('paddingV').value;
            const paddingH = document.getElementById('paddingH').value;
            
            if (marginV) styles.marginTop = marginV + 'px';
            if (marginH) styles.marginLeft = marginH + 'px';
            if (paddingV) styles.paddingTop = paddingV + 'px';
            if (paddingH) styles.paddingLeft = paddingH + 'px';
            
            // 字体
            const fontSize = document.getElementById('fontSize').value;
            const fontWeight = document.getElementById('fontWeight').value;
            const color = document.getElementById('colorText').value;
            const backgroundColor = document.getElementById('bgColorText').value;
            
            console.log('保存样式:', {
                fontSize,
                fontWeight,
                color,
                backgroundColor
            });
            
            if (fontSize) styles.fontSize = fontSize;
            if (fontWeight) styles.fontWeight = fontWeight;
            if (color && color !== 'transparent' && color.trim() !== '') {
                styles.color = color;
            }
            if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor.trim() !== '') {
                styles.backgroundColor = backgroundColor;
            }
            
            // 对齐
            const activeAlign = document.querySelector('.alignment-btn.active');
            if (activeAlign) {
                styles.textAlign = activeAlign.dataset.align;
            }
            
            // 自定义CSS
            const customCSS = document.getElementById('customCSS').value;
            if (customCSS) {
                const customStyles = this.parseCustomCSS(customCSS);
                Object.assign(styles, customStyles);
            }
            
            // 构建style属性
            const styleString = Object.entries(styles)
                .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
                .join('; ');
            
            console.log('生成的样式字符串:', styleString);
            console.log('样式对象:', styles);
            
            // 更新元素的HTML
            this.updateElementWithStyles(element, newText, styleString);
            
            // 关闭编辑器
            this.closeFloatingEditor();
            
        } catch (error) {
            console.error('保存悬浮编辑器修改失败:', error);
            this.updateStatus('保存失败: ' + error.message);
        }
    }

    // 解析自定义CSS
    parseCustomCSS(cssText) {
        const styles = {};
        if (!cssText.trim()) return styles;
        
        cssText.split(';').forEach(rule => {
            const [property, value] = rule.split(':').map(s => s.trim());
            if (property && value) {
                styles[this.kebabToCamel(property)] = value;
            }
        });
        
        return styles;
    }

    // 驼峰转短横线
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    // 短横线转驼峰
    kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    // 使用样式更新元素
    updateElementWithStyles(element, newText, styleString) {
        // 使用新的更新器
        if (window.ElementLocator && window.ElementUpdater) {
            try {
                // 获取元素标识信息
                const elementInfo = window.ElementLocator.getElementIdentifier(element);
                
                // 构建新的属性字符串
                const attrs = [];
                
                // 保留原有属性（除了style）
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    if (attr.name !== 'style' && !attr.name.startsWith('data-editor')) {
                        if (attr.name === 'class') {
                            const cleanedClasses = attr.value
                                .split(' ')
                                .filter(cls => !cls.includes('editor-highlight'))
                                .join(' ')
                                .trim();
                            if (cleanedClasses) {
                                attrs.push(`${attr.name}="${cleanedClasses}"`);
                            }
                        } else {
                            attrs.push(`${attr.name}="${attr.value}"`);
                        }
                    }
                }
                
                // 添加style属性
                if (styleString) {
                    attrs.push(`style="${styleString}"`);
                }
                
                // 使用新的更新器
                const success = window.ElementUpdater.updateElement(
                    element,
                    elementInfo,
                    newText,
                    attrs.join(' '),
                    this.editor.getModel()
                );
                
                if (success) {
                    this.updateStatus('元素已更新');
                    
                    // 立即清除高亮
                    if (element) {
                        element.classList.remove('editor-highlight');
                        if (element.style) {
                            element.style.removeProperty('background');
                            element.style.removeProperty('background-color');
                            element.style.removeProperty('outline');
                            element.style.removeProperty('outline-offset');
                        }
                    }
                    
                    // 延迟更新预览
                    setTimeout(() => {
                        this.updatePreview();
                    }, 100);
                } else {
                    this.updateStatus('更新失败，请手动修改');
                }
                
            } catch (error) {
                console.error('更新元素失败:', error);
                this.updateStatus('更新失败: ' + error.message);
            }
        } else {
            // 回退到旧的更新方法
            const tagName = element.tagName.toLowerCase();
            const attrs = [];
            
            // 保留原有属性（除了style）
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                if (attr.name !== 'style' && !attr.name.startsWith('data-editor')) {
                    if (attr.name === 'class') {
                        const cleanedClasses = attr.value
                            .split(' ')
                            .filter(cls => !cls.includes('editor-highlight'))
                            .join(' ')
                            .trim();
                        if (cleanedClasses) {
                            attrs.push(`${attr.name}="${cleanedClasses}"`);
                        }
                    } else {
                        attrs.push(`${attr.name}="${attr.value}"`);
                    }
                }
            }
            
            // 添加style属性
            if (styleString) {
                attrs.push(`style="${styleString}"`);
            }
            
            // 调用更新函数
            this.updateElementInCode(element, newText, attrs.join(' '));
        }
    }

    // 关闭悬浮编辑面板
    closeFloatingEditor() {
        const floatingEditor = document.getElementById('floatingEditor');
        if (floatingEditor) {
            floatingEditor.style.display = 'none';
        }
        
        // 清除当前编辑元素的高亮
        if (this.currentEditElement) {
            this.currentEditElement.classList.remove('editor-highlight');
            // 移除可能的内联样式
            if (this.currentEditElement.style) {
                this.currentEditElement.style.removeProperty('background');
                this.currentEditElement.style.removeProperty('background-color');
                this.currentEditElement.style.removeProperty('outline');
                this.currentEditElement.style.removeProperty('outline-offset');
            }
        }
        
        this.currentEditElement = null;
        this.clearPreviewHighlight();
    }

    // 更新预览
    updatePreview() {
        if (!this.previewFrame) return;

        const htmlContent = this.editor.getValue();
        
        // 方法1：使用srcdoc（更好的兼容性）
        try {
            // 对于现代浏览器，直接使用srcdoc
            this.previewFrame.srcdoc = htmlContent;
            
            // 重新设置交互
            this.previewFrame.onload = () => {
                setTimeout(() => {
                    // 清除所有高亮
                    this.clearPreviewHighlight();
                    this.setupPreviewInteraction();
                }, 100);
            };
            
            this.updateStatus('预览已更新');
            
        } catch (e) {
            // 方法2：回退到data URL（某些旧浏览器）
            try {
                const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
                this.previewFrame.src = dataUrl;
                
                this.previewFrame.onload = () => {
                    setTimeout(() => {
                        // 清除所有高亮
                        this.clearPreviewHighlight();
                        this.setupPreviewInteraction();
                    }, 100);
                };
                
                this.updateStatus('预览已更新（兼容模式）');
                
            } catch (e2) {
                // 方法3：最后的回退方案 - document.write
                try {
                    const previewDoc = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
                    previewDoc.open();
                    previewDoc.write(htmlContent);
                    previewDoc.close();
                    
                    setTimeout(() => {
                        // 清除所有高亮
                        this.clearPreviewHighlight();
                        this.setupPreviewInteraction();
                    }, 100);
                    
                    this.updateStatus('预览已更新（传统模式）');
                    
                } catch (e3) {
                    console.error('所有预览更新方法都失败了:', e3);
                    this.updateStatus('预览更新失败，请检查浏览器设置');
                }
            }
        }
    }

    // 绑定事件
    bindEvents() {
        // 工具栏按钮事件
        document.getElementById('newBtn').addEventListener('click', () => this.newDocument());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCode());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyCode());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDocument());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadDocument());
        document.getElementById('downloadHtmlBtn').addEventListener('click', () => this.downloadHTML());
        document.getElementById('exportPngBtn').addEventListener('click', () => this.exportToImage());
        document.getElementById('exportPngBtnFloat').addEventListener('click', () => this.exportToImage());
        document.getElementById('formatBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('previewModeBtn').addEventListener('click', () => this.togglePreviewMode());
        document.getElementById('refreshBtn').addEventListener('click', () => this.updatePreview());
        
        // 编辑器控制按钮
        document.getElementById('wrapToggle').addEventListener('click', () => this.toggleWordWrap());
        document.getElementById('miniMapToggle').addEventListener('click', () => this.toggleMiniMap());
        
        // 联系按钮
        document.getElementById('contactBtn').addEventListener('click', () => {
            window.open('', '_blank');
        });
        
        // 设备选择
        document.getElementById('deviceSelect').addEventListener('change', (e) => {
            this.setDeviceMode(e.target.value);
        });

        // 注释掉旧的模态框事件，避免双击时弹出
        // document.getElementById('modalClose').addEventListener('click', () => this.closeElementEditor());
        // document.getElementById('saveChanges').addEventListener('click', () => this.saveElementChanges());
        // document.getElementById('cancelChanges').addEventListener('click', () => this.closeElementEditor());
        
        // 文件输入
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // 文件拖放
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => this.handleFileDrop(e));

        // 监听全屏状态变化
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());

        // 注释掉点击模态框外部关闭，避免意外触发
        // document.getElementById('editModal').addEventListener('click', (e) => {
        //     if (e.target.id === 'editModal') {
        //         this.closeElementEditor();
        //     }
        // });
    }

    // 初始化分割线拖拽
    initResizer() {
        const resizer = document.getElementById('resizer');
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = editorPanel.offsetWidth;
            
            // 添加resizing类到body
            document.body.classList.add('resizing');
            
            // 阻止默认行为和事件冒泡
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // 使用requestAnimationFrame优化性能
            requestAnimationFrame(() => {
                const containerRect = document.querySelector('.main-content').getBoundingClientRect();
                const newWidth = startWidth + (e.clientX - startX);
                const newLeftWidth = (newWidth / containerRect.width) * 100;
                
                // 限制最小和最大宽度
                if (newLeftWidth > 20 && newLeftWidth < 80) {
                    editorPanel.style.flex = `0 0 ${newLeftWidth}%`;
                    previewPanel.style.flex = `0 0 ${100 - newLeftWidth}%`;
                    
                    // 触发Monaco Editor的resize
                    if (this.editor) {
                        this.editor.layout();
                    }
                }
            });
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                // 移除resizing类
                document.body.classList.remove('resizing');
            }
        });
        
        // 处理鼠标离开窗口的情况
        document.addEventListener('mouseleave', () => {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('resizing');
            }
        });
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 文档操作方法
    newDocument() {
        // 新建功能改为清空代码
        this.clearCode();
    }

    // 清空代码
    clearCode() {
        if (this.editor.getValue().trim() !== '') {
            // 保存当前内容到撤销历史
            const currentContent = this.editor.getValue();
            
            // 清空代码
            this.editor.setValue('');
            this.updatePreview();
            
            // 显示成功通知，带撤销选项
            const notification = this.showWarning('代码已清空', '您可以使用 Ctrl+Z 撤销此操作');
            
            // 可以在通知中添加撤销按钮（可选）
            // 这里我们依赖编辑器自带的撤销功能
        } else {
            this.showInfo('代码已经是空的');
        }
    }

    // 复制代码
    copyCode() {
        const code = this.editor.getValue();
        
        // 使用现代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(code).then(() => {
                this.showSuccess('代码已复制到剪贴板');
                
                // 显示复制成功的视觉反馈
                const copyBtn = document.getElementById('copyBtn');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                copyBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                this.fallbackCopyCode(code);
            });
        } else {
            // 降级方案
            this.fallbackCopyCode(code);
        }
    }

    // 复制代码的降级方案
    fallbackCopyCode(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showSuccess('代码已复制到剪贴板');
                
                // 显示复制成功的视觉反馈
                const copyBtn = document.getElementById('copyBtn');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                copyBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            } else {
                this.showError('复制失败，请手动复制');
            }
        } catch (err) {
            console.error('复制失败:', err);
            this.showError('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
    }

    saveDocument() {
        // 如果有文件管理器，优先保存到数据库
        if (this.fileManagerUI) {
            this.fileManagerUI.saveCurrentFile();
        } else {
            // 降级到原始的文件下载方式
            const content = this.editor.getValue();
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.lastSavedContent = content;
            this.showSuccess('文档已保存');
            this.updateLastSaved(new Date().toLocaleTimeString());
        }
    }

    // 下载HTML文件
    downloadHTML() {
        const content = this.editor.getValue();
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `HTMLPro_${timestamp}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('HTML文件已下载');
        
        // 显示成功的视觉反馈
        const downloadBtn = document.getElementById('downloadHtmlBtn');
        const originalInnerHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> <span>已下载</span>';
        downloadBtn.style.background = 'rgba(40, 167, 69, 0.2)';
        downloadBtn.style.color = '#28a745';
        downloadBtn.style.borderColor = 'rgba(40, 167, 69, 0.3)';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalInnerHTML;
            downloadBtn.style.background = '';
            downloadBtn.style.color = '';
            downloadBtn.style.borderColor = '';
        }, 2000);
    }

    // PNG导出功能
    async exportToImage() {
        const iframeElement = document.getElementById('previewFrame');
        if (!iframeElement || !iframeElement.contentDocument || !iframeElement.contentDocument.body) {
            this.showError('预览区域未找到或未加载完成');
            console.error('Preview iframe or its content is not available for exportToImage.');
            return;
        }
        
        const doc = iframeElement.contentDocument;
        const elementToCapture = doc.body;
        
        try {
            // 显示导出中的状态
            this.showInfo('正在导出PNG...');
            const exportBtn = document.getElementById('exportPngBtn');
            const originalText = exportBtn.textContent;
            exportBtn.textContent = '导出中...';
            exportBtn.disabled = true;
            
            // 创建一个临时的样式来确保图标和图片正确渲染
            const tempStyle = doc.createElement('style');
            tempStyle.textContent = `
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
                
                /* 强制Font Awesome图标使用正确的字体 */
                .fa, .fas, .far, .fal, .fad, .fab, 
                i[class*="fa-"] {
                    font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
                    font-weight: 900 !important;
                    font-style: normal !important;
                    font-variant: normal !important;
                    text-rendering: auto !important;
                    line-height: 1 !important;
                    -webkit-font-smoothing: antialiased !important;
                    -moz-osx-font-smoothing: grayscale !important;
                    display: inline-block !important;
                }
                
                /* Font Awesome品牌图标 */
                .fab {
                    font-family: "Font Awesome 6 Brands" !important;
                    font-weight: 400 !important;
                }
                
                /* 确保伪元素正确显示 */
                .fa::before, .fas::before, .far::before, 
                .fal::before, .fad::before, .fab::before {
                    font-family: inherit !important;
                    font-weight: inherit !important;
                }
                
                /* 确保SVG图标显示 */
                svg {
                    display: inline-block !important;
                    vertical-align: -0.125em !important;
                }
                
                /* 确保图片显示 */
                img {
                    display: inline-block !important;
                    max-width: 100% !important;
                }
                
                /* 保留背景渐变 */
                * {
                    background-attachment: scroll !important;
                }
                
                /* 移除编辑器相关的样式 */
                .editor-highlight {
                    outline: none !important;
                    background: none !important;
                }
                
                .editor-element-indicator {
                    display: none !important;
                }
            `;
            doc.head.appendChild(tempStyle);
            
            // 等待所有图片加载完成
            const images = doc.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = () => {
                            console.warn('Image failed to load:', img.src);
                            resolve(); // 即使失败也继续
                        };
                    }
                });
            });
            
            await Promise.all(imagePromises);
            
            // 等待Font Awesome字体加载
            await new Promise(resolve => {
                // 检查字体是否已加载
                if (document.fonts && document.fonts.check) {
                    // 等待Font Awesome字体加载完成
                    const fontCheckInterval = setInterval(() => {
                        if (doc.fonts.check('900 16px "Font Awesome 6 Free"')) {
                            clearInterval(fontCheckInterval);
                            resolve();
                        }
                    }, 100);
                    
                    // 最多等待3秒
                    setTimeout(() => {
                        clearInterval(fontCheckInterval);
                        resolve();
                    }, 3000);
                } else {
                    // 如果不支持字体API，等待固定时间
                    setTimeout(resolve, 2000);
                }
            });
            
            // 获取原始背景色
            const computedStyle = doc.defaultView.getComputedStyle(elementToCapture);
            const bgColor = computedStyle.backgroundColor;
            
            // 使用html-to-image的更高级选项
            const dataUrl = await htmlToImage.toPng(elementToCapture, {
                quality: 0.95,
                backgroundColor: bgColor === 'rgba(0, 0, 0, 0)' ? null : bgColor,
                pixelRatio: 2,
                width: elementToCapture.scrollWidth,
                height: elementToCapture.scrollHeight,
                style: {
                    margin: '0',
                    padding: '0',
                },
                // 克隆时包含所有样式
                includeQueryParams: true,
                // 处理图片
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                // 过滤函数，确保所有元素都被包含
                filter: (node) => {
                    // 排除编辑器相关元素
                    if (node.classList && (node.classList.contains('editor-element-indicator') || 
                        node.classList.contains('editor-interaction-styles') ||
                        node.classList.contains('editor-interaction-script'))) {
                        return false;
                    }
                    return true;
                },
                // 确保外部资源被正确加载
                fetchRequestInit: {
                    mode: 'no-cors',
                    cache: 'force-cache'
                },
                // 处理跨域图片
                skipAutoScale: false,
                cacheBust: false,
                // 使用内联样式确保图标显示
                onclone: (clonedDoc) => {
                    // 获取根元素
                    const clonedBody = clonedDoc.body;
                    
                    // 复制计算后的样式到内联样式
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach((clonedEl, index) => {
                        // 获取原始元素
                        const originalElements = doc.querySelectorAll('*');
                        if (originalElements[index]) {
                            const originalStyle = doc.defaultView.getComputedStyle(originalElements[index]);
                            
                            // 复制背景相关样式
                            if (originalStyle.background && originalStyle.background !== 'none') {
                                clonedEl.style.background = originalStyle.background;
                            }
                            if (originalStyle.backgroundColor && originalStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                                clonedEl.style.backgroundColor = originalStyle.backgroundColor;
                            }
                            if (originalStyle.backgroundImage && originalStyle.backgroundImage !== 'none') {
                                clonedEl.style.backgroundImage = originalStyle.backgroundImage;
                            }
                        }
                    });
                    
                    // 处理Font Awesome图标
                    const icons = clonedDoc.querySelectorAll('.fa, .fas, .far, .fal, .fad, .fab, i[class*="fa-"]');
                    icons.forEach(icon => {
                        // 强制设置字体样式
                        icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 6 Brands"';
                        icon.style.fontWeight = '900';
                        icon.style.fontStyle = 'normal';
                        icon.style.fontVariant = 'normal';
                        icon.style.textRendering = 'auto';
                        icon.style.lineHeight = '1';
                        icon.style.display = 'inline-block';
                        
                        // 获取伪元素内容
                        const originalIcon = doc.querySelector(`[class="${icon.className}"]`);
                        if (originalIcon) {
                            const beforeContent = window.getComputedStyle(originalIcon, '::before').content;
                            if (beforeContent && beforeContent !== 'none') {
                                icon.textContent = beforeContent.replace(/['"]/g, '');
                            }
                        }
                    });
                    
                    // 确保所有图片都有正确的src
                    const clonedImages = clonedDoc.querySelectorAll('img');
                    clonedImages.forEach((img, index) => {
                        const originalImg = images[index];
                        if (originalImg && originalImg.src) {
                            img.src = originalImg.src;
                        }
                    });
                    
                    // 处理CSS变量
                    const rootStyle = doc.defaultView.getComputedStyle(doc.documentElement);
                    const cssVars = [
                        '--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary',
                        '--accent-primary', '--accent-secondary', '--border-color'
                    ];
                    
                    cssVars.forEach(varName => {
                        const value = rootStyle.getPropertyValue(varName);
                        if (value) {
                            clonedDoc.documentElement.style.setProperty(varName, value);
                        }
                    });
                }
            });
            
            // 清理临时样式
            tempStyle.remove();
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = dataUrl;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `HTMLPro_Export_${timestamp}.png`;
            link.click();
            
            // 恢复按钮状态
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
            
            this.showSuccess('PNG 导出成功！');
            
            // 显示成功的视觉反馈
            exportBtn.style.background = '#28a745';
            setTimeout(() => {
                exportBtn.style.background = '';
            }, 2000);
            
        } catch (err) {
            console.error('Export error:', err);
            this.showError('导出 PNG 失败，请查看控制台');
            
            // 恢复按钮状态
            const exportBtn = document.getElementById('exportPngBtn');
            exportBtn.textContent = '导出PNG';
            exportBtn.disabled = false;
        }
    }

    loadDocument() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.editor.setValue(e.target.result);
            this.lastSavedContent = e.target.result;
            this.showSuccess(`已加载文件: ${file.name}`);
            this.updateLastSaved('未保存');
        };
        reader.readAsText(file);
    }

    handleFileDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/html' || file.name.endsWith('.html')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editor.setValue(e.target.result);
                    this.showSuccess(`已加载文件: ${file.name}`);
                };
                reader.readAsText(file);
            } else {
                this.showWarning('请拖放HTML文件');
            }
        }
    }

    formatCode() {
        this.editor.getAction('editor.action.formatDocument').run();
        this.showSuccess('代码已格式化');
    }

    togglePreviewMode() {
        const previewPanel = document.getElementById('previewPanel');
        const btn = document.getElementById('previewModeBtn');
        
        if (!document.fullscreenElement) {
            // 进入全屏模式
            if (previewPanel.requestFullscreen) {
                previewPanel.requestFullscreen();
            } else if (previewPanel.mozRequestFullScreen) { // Firefox
                previewPanel.mozRequestFullScreen();
            } else if (previewPanel.webkitRequestFullscreen) { // Chrome, Safari and Opera
                previewPanel.webkitRequestFullscreen();
            } else if (previewPanel.msRequestFullscreen) { // IE/Edge
                previewPanel.msRequestFullscreen();
            }
            
            btn.innerHTML = '<i class="fas fa-compress"></i> <span>退出全屏</span>';
            this.updateStatus('已进入全屏模式');
            
            // 添加全屏样式类
            previewPanel.classList.add('fullscreen-preview');
            
            // 禁用可视化编辑
            this.disableVisualEditing();
            
        } else {
            // 退出全屏模式
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            
            btn.innerHTML = '<i class="fas fa-expand"></i> <span>全屏模式</span>';
            this.updateStatus('已退出全屏模式');
            
            // 移除全屏样式类
            previewPanel.classList.remove('fullscreen-preview');
            
            // 重新启用可视化编辑
            this.enableVisualEditing();
        }
    }

    // 处理全屏状态变化（例如用户按ESC退出全屏）
    handleFullscreenChange() {
        const btn = document.getElementById('previewModeBtn');
        const previewPanel = document.getElementById('previewPanel');
        
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // 已退出全屏
            btn.innerHTML = '<i class="fas fa-expand"></i> <span>全屏模式</span>';
            previewPanel.classList.remove('fullscreen-preview');
            this.updateStatus('已退出全屏模式');
            
            // 重新启用可视化编辑
            this.enableVisualEditing();
        }
    }
    
    // 禁用可视化编辑
    disableVisualEditing() {
        this.visualEditingEnabled = false;
        // 清除预览区的事件监听器
        this.clearPreviewEventListeners();
        // 清除所有高亮
        this.clearPreviewHighlight();
        // 关闭悬浮编辑器（如果打开的话）
        this.closeFloatingEditor();
    }
    
    // 启用可视化编辑
    enableVisualEditing() {
        this.visualEditingEnabled = true;
        // 重新设置预览交互
        this.setupPreviewInteraction();
    }

    toggleWordWrap() {
        const currentWrap = this.editor.getOption(monaco.editor.EditorOption.wordWrap);
        const newWrap = currentWrap === 'off' ? 'on' : 'off';
        this.editor.updateOptions({ wordWrap: newWrap });
        
        const btn = document.getElementById('wrapToggle');
        btn.classList.toggle('active', newWrap === 'on');
        
        this.updateStatus(`代码换行已${newWrap === 'on' ? '开启' : '关闭'}`);
    }

    toggleMiniMap() {
        const currentMinimap = this.editor.getOption(monaco.editor.EditorOption.minimap);
        const newEnabled = !currentMinimap.enabled;
        this.editor.updateOptions({ 
            minimap: { enabled: newEnabled }
        });
        
        const btn = document.getElementById('miniMapToggle');
        btn.classList.toggle('active', newEnabled);
        
        this.updateStatus(`小地图已${newEnabled ? '开启' : '关闭'}`);
    }

    setDeviceMode(mode) {
        const container = document.querySelector('.preview-container');
        container.className = 'preview-container';
        
        if (mode !== 'desktop') {
            container.classList.add(`device-${mode}`);
        }
        
        this.updateStatus(`已切换到${mode === 'desktop' ? '桌面' : mode === 'tablet' ? '平板' : '手机'}视图`);
    }

    // 键盘快捷键处理
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveDocument();
                    break;
                case 'n':
                    e.preventDefault();
                    this.newDocument();
                    break;
                case 'o':
                    e.preventDefault();
                    this.loadDocument();
                    break;
                case 'f':
                    e.preventDefault();
                    this.formatCode();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.closeElementEditor();
        }
    }

    // 工具方法
    hasUnsavedChanges() {
        return this.editor.getValue() !== this.lastSavedContent;
    }

    updateCursorPosition(position) {
        const positionElement = document.getElementById('cursorPosition');
        positionElement.textContent = `行 ${position.lineNumber}, 列 ${position.column}`;
    }

    updateDocumentStats() {
        const content = this.editor.getValue();
        const lines = content.split('\n').length;
        const chars = content.length;
        
        const statsElement = document.getElementById('documentStats');
        statsElement.textContent = `${lines} 行, ${chars} 字符`;
    }

    updateStatus(message) {
        const statusElement = document.getElementById('statusText');
        statusElement.textContent = message;
        
        // 3秒后恢复默认状态
        setTimeout(() => {
            statusElement.textContent = '就绪';
        }, 3000);
    }

    updateLastSaved(time) {
        const savedElement = document.getElementById('lastSaved');
        savedElement.textContent = time === '未保存' ? time : `已保存 ${time}`;
    }

    // 显示通知
    showNotification(title, message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // 图标映射
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                ${message ? `<div class="notification-message">${message}</div>` : ''}
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加到容器
        container.appendChild(notification);

        // 强制重排以触发动画
        notification.offsetHeight;

        // 显示通知
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    }

    // 隐藏通知
    hideNotification(notification) {
        if (!notification) return;
        
        notification.classList.add('hide');
        notification.classList.remove('show');
        
        // 动画结束后移除元素
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // 显示成功通知
    showSuccess(message, title = '成功') {
        return this.showNotification(title, message, 'success');
    }

    // 显示错误通知
    showError(message, title = '错误') {
        return this.showNotification(title, message, 'error', 5000);
    }

    // 显示警告通知
    showWarning(message, title = '警告') {
        return this.showNotification(title, message, 'warning', 4000);
    }

    // 显示信息通知
    showInfo(message, title = '提示') {
        return this.showNotification(title, message, 'info');
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new HTMLVisualEditor();
});

// 页面卸载前提醒保存
window.addEventListener('beforeunload', (e) => {
    if (window.editor && window.editor.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
        return e.returnValue;
    }
}); 