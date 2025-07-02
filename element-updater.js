/**
 * 元素更新器 - 精确更新HTML元素，支持嵌套结构
 */

class ElementUpdater {
    constructor() {
        this.debug = true;
    }

    /**
     * 更新元素的主函数
     */
    updateElement(element, elementInfo, newText, newAttrs, editorModel) {
        if (!element || !elementInfo || !editorModel) {
            console.error('缺少必要参数');
            return false;
        }

        try {
            const fullText = editorModel.getValue();
            const lines = fullText.split('\n');
            
            // 使用定位器查找元素位置
            const location = window.ElementLocator ? 
                window.ElementLocator.findElement(elementInfo, fullText) : null;
            
            if (!location) {
                console.error('无法定位元素');
                return false;
            }
            
            console.log('[ElementUpdater] 找到元素位置:', {
                行号: location.line,
                列号: location.column,
                置信度: location.confidence
            });
            
            // 解析元素的完整结构
            const elementStructure = this.parseElementStructure(
                lines, 
                location.line - 1, 
                location.column - 1, 
                elementInfo.tagName
            );
            
            if (!elementStructure) {
                console.error('无法解析元素结构');
                return false;
            }
            
            console.log('[ElementUpdater] 元素结构:', elementStructure);
            
            // 构建新的元素HTML
            const newElementHTML = this.buildNewElementHTML(
                elementStructure,
                elementInfo,
                newText,
                newAttrs
            );
            
            // 执行替换
            const newFullText = this.replaceElementInText(
                lines,
                elementStructure,
                newElementHTML
            );
            
            // 更新编辑器
            editorModel.setValue(newFullText);
            
            console.log('[ElementUpdater] 元素更新成功');
            return true;
            
        } catch (error) {
            console.error('[ElementUpdater] 更新失败:', error);
            return false;
        }
    }

    /**
     * 解析元素的完整结构
     */
    parseElementStructure(lines, startLine, startCol, tagName) {
        const structure = {
            tagName: tagName,
            startLine: startLine,
            startCol: startCol,
            endLine: -1,
            endCol: -1,
            openTag: '',
            closeTag: '',
            content: '',
            hasChildren: false,
            isSelfClosing: false,
            originalHTML: ''
        };
        
        // 检查是否为自闭合标签
        const voidElements = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        const isVoidElement = voidElements.includes(tagName.toLowerCase());
        
        // 查找开始标签
        const currentLine = lines[startLine];
        const tagStartMatch = currentLine.substring(startCol).match(/^<[^>]+>/);
        
        if (!tagStartMatch) {
            return null;
        }
        
        structure.openTag = tagStartMatch[0];
        const openTagEndCol = startCol + tagStartMatch[0].length;
        
        // 检查是否为自闭合
        if (structure.openTag.endsWith('/>') || isVoidElement) {
            structure.isSelfClosing = true;
            structure.endLine = startLine;
            structure.endCol = openTagEndCol;
            structure.originalHTML = structure.openTag;
            return structure;
        }
        
        // 查找结束标签
        let depth = 0;
        let foundEnd = false;
        const contentParts = [];
        
        for (let i = startLine; i < lines.length && !foundEnd; i++) {
            const line = lines[i];
            const searchStart = (i === startLine) ? openTagEndCol : 0;
            
            // 收集内容
            if (i === startLine) {
                contentParts.push(line.substring(openTagEndCol));
            } else {
                contentParts.push(line);
            }
            
            // 查找标签
            const tagRegex = new RegExp(`<\\/?${tagName}[^>]*>`, 'gi');
            let match;
            
            while ((match = tagRegex.exec(line.substring(searchStart))) !== null) {
                const fullMatch = match[0];
                const matchPos = searchStart + match.index;
                
                if (fullMatch.startsWith('</')) {
                    // 结束标签
                    if (depth === 0) {
                        structure.endLine = i;
                        structure.endCol = matchPos + fullMatch.length;
                        structure.closeTag = fullMatch;
                        foundEnd = true;
                        
                        // 截取内容
                        if (i === startLine) {
                            structure.content = line.substring(openTagEndCol, matchPos);
                        } else {
                            contentParts[contentParts.length - 1] = 
                                lines[i].substring(0, matchPos);
                            structure.content = contentParts.join('\n');
                        }
                        
                        break;
                    } else {
                        depth--;
                    }
                } else if (!fullMatch.endsWith('/>')) {
                    // 开始标签
                    if (i !== startLine || matchPos !== startCol) {
                        depth++;
                        structure.hasChildren = true;
                    }
                }
            }
        }
        
        if (!foundEnd) {
            return null;
        }
        
        // 构建原始HTML
        if (structure.startLine === structure.endLine) {
            structure.originalHTML = lines[structure.startLine].substring(
                structure.startCol,
                structure.endCol
            );
        } else {
            const parts = [];
            parts.push(lines[structure.startLine].substring(structure.startCol));
            
            for (let i = structure.startLine + 1; i < structure.endLine; i++) {
                parts.push(lines[i]);
            }
            
            parts.push(lines[structure.endLine].substring(0, structure.endCol));
            structure.originalHTML = parts.join('\n');
        }
        
        return structure;
    }

    /**
     * 构建新的元素HTML
     */
    buildNewElementHTML(structure, elementInfo, newText, newAttrs) {
        const tagName = structure.tagName;
        
        // 构建新的开始标签
        let newOpenTag;
        if (newAttrs && newAttrs.trim()) {
            newOpenTag = `<${tagName} ${newAttrs}>`;
        } else {
            // 保留原有属性，只更新必要的部分
            newOpenTag = structure.openTag;
        }
        
        // 自闭合标签
        if (structure.isSelfClosing) {
            if (newAttrs && newAttrs.trim()) {
                return `<${tagName} ${newAttrs} />`;
            } else {
                return structure.originalHTML;
            }
        }
        
        // 处理内容
        let newContent;
        
        if (!structure.hasChildren) {
            // 没有子元素，直接使用新文本
            newContent = newText;
        } else {
            // 有子元素，需要智能替换
            newContent = this.updateContentWithChildren(
                structure.content,
                elementInfo,
                newText
            );
        }
        
        // 组合新的HTML
        return newOpenTag + newContent + structure.closeTag;
    }

    /**
     * 更新包含子元素的内容
     */
    updateContentWithChildren(originalContent, elementInfo, newText) {
        // 如果元素有直接文本内容，只替换直接文本
        if (elementInfo.directText) {
            // 查找并替换直接文本节点
            // 这里需要更智能的处理，保留子元素结构
            
            // 简单情况：文本在最前面
            if (originalContent.trimStart().startsWith(elementInfo.directText)) {
                return originalContent.replace(elementInfo.directText, newText);
            }
            
            // 复杂情况：需要解析内容结构
            // 这里可以进一步优化
            return originalContent;
        }
        
        // 如果没有直接文本，返回原内容
        return originalContent;
    }

    /**
     * 在文本中替换元素
     */
    replaceElementInText(lines, structure, newHTML) {
        const newLines = [...lines];
        
        if (structure.startLine === structure.endLine) {
            // 单行替换
            newLines[structure.startLine] = 
                lines[structure.startLine].substring(0, structure.startCol) +
                newHTML +
                lines[structure.startLine].substring(structure.endCol);
        } else {
            // 多行替换
            const before = lines[structure.startLine].substring(0, structure.startCol);
            const after = lines[structure.endLine].substring(structure.endCol);
            
            // 删除旧行，插入新内容
            newLines.splice(
                structure.startLine,
                structure.endLine - structure.startLine + 1,
                before + newHTML + after
            );
        }
        
        return newLines.join('\n');
    }

    /**
     * 生成更新建议
     */
    generateUpdateSuggestion(tagName, newText, newAttrs) {
        const isVoid = ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase());
        
        if (isVoid) {
            return newAttrs ? `<${tagName} ${newAttrs} />` : `<${tagName} />`;
        } else {
            return newAttrs ? 
                `<${tagName} ${newAttrs}>${newText}</${tagName}>` : 
                `<${tagName}>${newText}</${tagName}>`;
        }
    }
}

// 导出单例
window.ElementUpdater = new ElementUpdater(); 