/**
 * 元素定位器 - 精确定位元素在代码中的位置
 * 基于用户提供的参考算法改进
 */

class ElementLocator {
    constructor() {
        this.debug = true; // 开启调试日志
    }

    /**
     * 获取元素的唯一标识信息
     */
    getElementIdentifier(element) {
        // 获取直接文本内容（不包括子元素）
        const directText = this.getDirectTextContent(element);
        
        // 获取所有文本节点
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node.nodeValue.trim());
        }

        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || undefined,
            className: element.className || undefined,
            innerText: element.innerText?.trim() || undefined,
            textContent: element.textContent?.trim() || undefined,
            directText: directText || undefined,
            textNodes: textNodes,
            attributes: this.getElementAttributes(element),
            // 额外的定位信息
            isInlineElement: this.isInlineElement(element.tagName),
            hasSpecialClass: element.className && (
                element.className.includes('gradient') ||
                element.className.includes('text-') ||
                element.className.includes('btn') ||
                element.className.includes('icon')
            ),
            hasInlineStyle: element.hasAttribute('style'),
            // 父元素信息（用于嵌套元素定位）
            parentInfo: element.parentElement ? {
                tagName: element.parentElement.tagName.toLowerCase(),
                id: element.parentElement.id || undefined,
                className: element.parentElement.className || undefined
            } : null
        };
    }

    /**
     * 获取元素的直接文本内容
     */
    getDirectTextContent(element) {
        let directText = '';
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                directText += node.textContent;
            }
        }
        return directText.trim();
    }

    /**
     * 获取元素属性
     */
    getElementAttributes(element) {
        const attrs = {};
        for (const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }

    /**
     * 判断是否为内联元素
     */
    isInlineElement(tagName) {
        const inlineElements = ['span', 'strong', 'em', 'b', 'i', 'mark', 'sup', 'sub', 'a', 'code', 'small'];
        return inlineElements.includes(tagName.toLowerCase());
    }

    /**
     * 主定位函数 - 在代码中查找元素位置
     */
    locateElement(elementInfo, code) {
        if (!elementInfo.tagName || !code) {
            return null;
        }

        const lines = code.split('\n');
        const tagName = elementInfo.tagName.toLowerCase();
        
        if (this.debug) {
            console.log('[ElementLocator] 查找元素:', elementInfo);
        }
        
        // 候选位置列表
        const candidates = [];
        
        // 构建搜索模式
        const searchPatterns = this.buildSearchPatterns(elementInfo);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            // 必须包含标签开始
            if (!lowerLine.includes(`<${tagName}`)) {
                continue;
            }
            
            let confidence = 10; // 基础分数
            let matchDetails = [];
            
            // 检查每个搜索模式
            for (const pattern of searchPatterns) {
                if (pattern.test(line)) {
                    confidence += pattern.score;
                    matchDetails.push(pattern.name);
                }
            }
            
            // 特殊处理嵌套元素
            if (elementInfo.parentInfo) {
                // 检查前面几行是否有父元素
                const parentTagName = elementInfo.parentInfo.tagName;
                let foundParent = false;
                
                for (let j = Math.max(0, i - 10); j < i; j++) {
                    if (lines[j].toLowerCase().includes(`<${parentTagName}`)) {
                        if (elementInfo.parentInfo.id && lines[j].includes(`id="${elementInfo.parentInfo.id}"`)) {
                            foundParent = true;
                            confidence += 50;
                            matchDetails.push('parent-id-match');
                            break;
                        } else if (elementInfo.parentInfo.className && lines[j].includes(`class="${elementInfo.parentInfo.className}"`)) {
                            foundParent = true;
                            confidence += 30;
                            matchDetails.push('parent-class-match');
                            break;
                        }
                    }
                }
                
                if (foundParent) {
                    confidence += 20;
                }
            }
            
            // 查找标签开始位置
            const tagStart = line.indexOf(`<${tagName}`);
            if (tagStart !== -1 && confidence > 10) {
                candidates.push({
                    line: i + 1, // 转换为1基索引
                    column: tagStart + 1,
                    confidence: confidence,
                    matchDetails: matchDetails,
                    preview: line.trim()
                });
            }
        }
        
        // 按置信度排序
        candidates.sort((a, b) => b.confidence - a.confidence);
        
        if (this.debug) {
            console.log('[ElementLocator] 候选结果:', candidates.slice(0, 3));
        }
        
        // 返回最佳匹配
        const best = candidates[0];
        return best && best.confidence >= 20 ? best : null;
    }

    /**
     * 构建搜索模式
     */
    buildSearchPatterns(elementInfo) {
        const patterns = [];
        const tagName = elementInfo.tagName;
        
        // ID精确匹配 - 最高优先级
        if (elementInfo.id) {
            patterns.push({
                name: 'id-exact',
                test: (line) => line.includes(`id="${elementInfo.id}"`),
                score: 100
            });
        }
        
        // 类名匹配
        if (elementInfo.className) {
            // 完整类名匹配
            patterns.push({
                name: 'class-exact',
                test: (line) => line.includes(`class="${elementInfo.className}"`),
                score: 50
            });
            
            // 部分类名匹配（处理多个类的情况）
            const classes = elementInfo.className.split(' ').filter(c => c && !c.includes('editor-highlight'));
            for (const cls of classes) {
                patterns.push({
                    name: `class-partial-${cls}`,
                    test: (line) => line.includes(cls),
                    score: 20
                });
            }
        }
        
        // 直接文本内容匹配
        if (elementInfo.directText) {
            patterns.push({
                name: 'direct-text',
                test: (line) => line.includes(`>${elementInfo.directText}<`),
                score: 80
            });
        }
        
        // 文本节点匹配
        if (elementInfo.textNodes && elementInfo.textNodes.length > 0) {
            for (const text of elementInfo.textNodes) {
                if (text.length > 1) {
                    patterns.push({
                        name: `text-node-${text.substring(0, 10)}`,
                        test: (line) => line.includes(text),
                        score: 30
                    });
                }
            }
        }
        
        // 属性匹配
        if (elementInfo.attributes) {
            for (const [attr, value] of Object.entries(elementInfo.attributes)) {
                if (attr !== 'class' && attr !== 'id' && value) {
                    patterns.push({
                        name: `attr-${attr}`,
                        test: (line) => line.includes(`${attr}="${value}"`),
                        score: 25
                    });
                }
            }
        }
        
        // 特殊样式匹配
        if (elementInfo.hasInlineStyle && elementInfo.attributes?.style) {
            const styleFragments = elementInfo.attributes.style.split(';').map(s => s.trim()).filter(s => s);
            for (const fragment of styleFragments) {
                patterns.push({
                    name: `style-${fragment.substring(0, 10)}`,
                    test: (line) => line.includes(fragment),
                    score: 15
                });
            }
        }
        
        return patterns;
    }

    /**
     * 备用定位策略
     */
    fallbackLocate(elementInfo, code) {
        const lines = code.split('\n');
        const tagName = elementInfo.tagName.toLowerCase();
        
        // 简单策略：找到第一个匹配的标签
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const tagStart = line.toLowerCase().indexOf(`<${tagName}`);
            
            if (tagStart !== -1) {
                return {
                    line: i + 1,
                    column: tagStart + 1,
                    confidence: 5,
                    matchDetails: ['fallback'],
                    preview: line.trim()
                };
            }
        }
        
        return null;
    }

    /**
     * 组合定位策略
     */
    findElement(elementInfo, code) {
        // 首先尝试主策略
        const primary = this.locateElement(elementInfo, code);
        if (primary && primary.confidence >= 50) {
            return primary;
        }
        
        // 如果主策略置信度不高，尝试备用策略
        const fallback = this.fallbackLocate(elementInfo, code);
        
        // 返回较好的结果
        if (primary && fallback) {
            return primary.confidence >= fallback.confidence ? primary : fallback;
        }
        
        return primary || fallback;
    }
}

// 导出单例
window.ElementLocator = new ElementLocator(); 