/**
 * 文件管理器UI交互
 */

class FileManagerUI {
    constructor(editor) {
        this.editor = editor;
        this.fileManager = window.fileManager;
        this.selectedFileId = null;
        this.init();
    }

    async init() {
        await this.waitForDB();
        this.bindEvents();
        this.loadFileList();
    }

    async waitForDB() {
        // 等待数据库初始化完成
        let retries = 0;
        while (!this.fileManager.db && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        if (!this.fileManager.db) {
            console.error('数据库初始化失败');
        }
    }

    bindEvents() {
        // 打开文件管理器
        document.getElementById('fileManagerBtn').addEventListener('click', () => {
            this.openFileManager();
        });

        // 关闭文件管理器
        document.getElementById('fileManagerClose').addEventListener('click', () => {
            this.closeFileManager();
        });

        // 点击模态框外部关闭
        document.getElementById('fileManagerModal').addEventListener('click', (e) => {
            if (e.target.id === 'fileManagerModal') {
                this.closeFileManager();
            }
        });

        // 新建文件
        document.getElementById('newFileBtn').addEventListener('click', () => {
            this.createNewFile();
        });

        // 导入文件
        document.getElementById('importFileBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', async (e) => {
            await this.handleFileImport(e.target.files);
            e.target.value = ''; // 清空input
        });

        // 搜索文件
        document.getElementById('fileSearchInput').addEventListener('input', (e) => {
            this.searchFiles(e.target.value);
        });

        // 清空全部
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllFiles();
        });

        // 文件拖拽
        const fileListContainer = document.getElementById('fileListContainer');
        fileListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileListContainer.classList.add('drag-over');
        });

        fileListContainer.addEventListener('dragleave', () => {
            fileListContainer.classList.remove('drag-over');
        });

        fileListContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            fileListContainer.classList.remove('drag-over');
            await this.handleFileImport(e.dataTransfer.files);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'm') {
                    e.preventDefault();
                    this.toggleFileManager();
                }
            }
        });
    }

    openFileManager() {
        const modal = document.getElementById('fileManagerModal');
        modal.classList.add('show');
        this.loadFileList();
        this.updateStats();
    }

    closeFileManager() {
        const modal = document.getElementById('fileManagerModal');
        modal.classList.remove('show');
    }

    toggleFileManager() {
        const modal = document.getElementById('fileManagerModal');
        if (modal.classList.contains('show')) {
            this.closeFileManager();
        } else {
            this.openFileManager();
        }
    }

    async loadFileList() {
        try {
            const files = await this.fileManager.getAllFiles();
            this.renderFileList(files);
            this.updateStats();
        } catch (error) {
            console.error('加载文件列表失败:', error);
        }
    }

    renderFileList(files) {
        const fileList = document.getElementById('fileList');
        const emptyState = document.getElementById('emptyState');

        if (files.length === 0) {
            fileList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        fileList.style.display = 'grid';
        emptyState.style.display = 'none';

        fileList.innerHTML = files.map(file => `
            <div class="file-item ${file.id === this.fileManager.currentFileId ? 'selected' : ''}" data-file-id="${file.id}">
                <div class="file-icon">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-meta">
                        <span>${this.fileManager.formatFileSize(file.size)}</span>
                        <span>${this.fileManager.formatDate(file.updatedAt)}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn" data-action="open" title="打开">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="file-action-btn" data-action="rename" title="重命名">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="file-action-btn" data-action="export" title="导出">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn delete" data-action="delete" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定文件项事件
        fileList.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    this.selectFile(parseInt(item.dataset.fileId));
                }
            });

            item.addEventListener('dblclick', (e) => {
                if (!e.target.closest('.file-actions')) {
                    this.openFile(parseInt(item.dataset.fileId));
                }
            });
        });

        // 绑定操作按钮事件
        fileList.querySelectorAll('.file-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = parseInt(btn.closest('.file-item').dataset.fileId);
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'open':
                        this.openFile(fileId);
                        break;
                    case 'rename':
                        this.renameFile(fileId);
                        break;
                    case 'export':
                        this.exportFile(fileId);
                        break;
                    case 'delete':
                        this.deleteFile(fileId);
                        break;
                }
            });
        });
    }

    async createNewFile() {
        const name = prompt('请输入文件名:', '未命名文件');
        if (name) {
            try {
                const content = this.editor.editor.getValue();
                const fileId = await this.fileManager.saveFile(name, content);
                this.fileManager.currentFileId = fileId;
                await this.loadFileList();
                this.editor.showSuccess(`文件 "${name}" 已创建`);
            } catch (error) {
                console.error('创建文件失败:', error);
                this.editor.showError('创建文件失败');
            }
        }
    }

    async openFile(fileId) {
        try {
            const file = await this.fileManager.getFile(fileId);
            if (file) {
                this.editor.editor.setValue(file.content);
                this.fileManager.currentFileId = fileId;
                this.editor.lastSavedContent = file.content;
                this.editor.showSuccess(`已打开文件: ${file.name}`);
                this.editor.updateLastSaved(this.fileManager.formatDate(file.updatedAt));
                this.closeFileManager();
            }
        } catch (error) {
            console.error('打开文件失败:', error);
            this.editor.showError('打开文件失败');
        }
    }

    selectFile(fileId) {
        this.selectedFileId = fileId;
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.fileId) === fileId);
        });
    }

    async renameFile(fileId) {
        try {
            const file = await this.fileManager.getFile(fileId);
            const newName = prompt('请输入新的文件名:', file.name);
            if (newName && newName !== file.name) {
                await this.fileManager.renameFile(fileId, newName);
                await this.loadFileList();
                this.editor.showSuccess(`文件已重命名为: ${newName}`);
            }
        } catch (error) {
            console.error('重命名失败:', error);
            this.editor.showError('重命名失败');
        }
    }

    async exportFile(fileId) {
        try {
            const file = await this.fileManager.getFile(fileId);
            this.fileManager.exportFile(file);
            this.editor.showSuccess(`文件 "${file.name}" 已导出`);
        } catch (error) {
            console.error('导出文件失败:', error);
            this.editor.showError('导出文件失败');
        }
    }

    async deleteFile(fileId) {
        try {
            const file = await this.fileManager.getFile(fileId);
            if (confirm(`确定要删除文件 "${file.name}" 吗？`)) {
                await this.fileManager.deleteFile(fileId);
                await this.loadFileList();
                this.editor.showSuccess(`文件 "${file.name}" 已删除`);
                
                // 如果删除的是当前文件，清空编辑器
                if (fileId === this.fileManager.currentFileId) {
                    this.editor.newDocument();
                }
            }
        } catch (error) {
            console.error('删除文件失败:', error);
            this.editor.showError('删除文件失败');
        }
    }

    async handleFileImport(files) {
        const htmlFiles = Array.from(files).filter(file => 
            file.type === 'text/html' || file.name.endsWith('.html')
        );

        if (htmlFiles.length === 0) {
            this.editor.showWarning('请选择HTML文件');
            return;
        }

        try {
            for (const file of htmlFiles) {
                await this.fileManager.importFile(file);
            }
            await this.loadFileList();
            this.editor.showSuccess(`已导入 ${htmlFiles.length} 个文件`);
        } catch (error) {
            console.error('导入文件失败:', error);
            this.editor.showError('导入文件失败');
        }
    }

    async searchFiles(keyword) {
        try {
            const files = keyword 
                ? await this.fileManager.searchFiles(keyword)
                : await this.fileManager.getAllFiles();
            this.renderFileList(files);
        } catch (error) {
            console.error('搜索文件失败:', error);
        }
    }

    async clearAllFiles() {
        if (confirm('确定要清空所有文件吗？此操作不可恢复！')) {
            try {
                await this.fileManager.clearAll();
                await this.loadFileList();
                this.editor.newDocument();
                this.editor.showSuccess('所有文件已清空');
            } catch (error) {
                console.error('清空文件失败:', error);
                this.editor.showError('清空文件失败');
            }
        }
    }

    async updateStats() {
        try {
            const stats = await this.fileManager.getStats();
            const statsElement = document.getElementById('fileStats');
            statsElement.textContent = `${stats.totalFiles} 个文件 · ${this.fileManager.formatFileSize(stats.totalSize)}`;
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 保存当前文件到数据库
    async saveCurrentFile() {
        const content = this.editor.editor.getValue();
        
        if (this.fileManager.currentFileId) {
            // 更新现有文件
            try {
                const file = await this.fileManager.getFile(this.fileManager.currentFileId);
                await this.fileManager.saveFile(file.name, content, this.fileManager.currentFileId);
                this.editor.showSuccess(`文件 "${file.name}" 已保存`);
                this.editor.lastSavedContent = content;
                this.editor.updateLastSaved(new Date().toLocaleTimeString());
            } catch (error) {
                console.error('保存文件失败:', error);
                this.editor.showError('保存文件失败');
            }
        } else {
            // 创建新文件
            this.createNewFile();
        }
    }
}

// 导出UI管理器
window.FileManagerUI = FileManagerUI; 