/**
 * 文件管理器模块
 * 使用IndexedDB本地存储HTML文件
 */

class FileManager {
    constructor() {
        this.dbName = 'HTMLProFileDB';
        this.dbVersion = 1;
        this.storeName = 'htmlFiles';
        this.db = null;
        this.currentFileId = null;
        
        this.initDB();
    }

    // 初始化数据库
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('数据库打开失败');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库连接成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建文件存储对象
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // 创建索引
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                    objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
            };
        });
    }

    // 保存文件
    async saveFile(name, content, id = null) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const file = {
            name: name,
            content: content,
            createdAt: id ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            size: new Blob([content]).size
        };

        if (id) {
            file.id = id;
            // 保留原始创建时间
            const existingFile = await this.getFile(id);
            if (existingFile) {
                file.createdAt = existingFile.createdAt;
            }
        }

        return new Promise((resolve, reject) => {
            const request = id ? store.put(file) : store.add(file);
            
            request.onsuccess = () => {
                this.currentFileId = request.result;
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 获取文件
    async getFile(id) {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 获取所有文件
    async getAllFiles() {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                // 按更新时间降序排序
                const files = request.result.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                resolve(files);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 删除文件
    async deleteFile(id) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            
            request.onsuccess = () => {
                if (this.currentFileId === id) {
                    this.currentFileId = null;
                }
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 重命名文件
    async renameFile(id, newName) {
        const file = await this.getFile(id);
        if (file) {
            file.name = newName;
            file.updatedAt = new Date().toISOString();
            return this.saveFile(file.name, file.content, id);
        }
        throw new Error('文件不存在');
    }

    // 搜索文件
    async searchFiles(keyword) {
        const allFiles = await this.getAllFiles();
        return allFiles.filter(file => 
            file.name.toLowerCase().includes(keyword.toLowerCase()) ||
            file.content.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // 导出文件为HTML
    exportFile(file) {
        const blob = new Blob([file.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.endsWith('.html') ? file.name : `${file.name}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 导入HTML文件
    async importFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    const name = file.name.replace(/\.html?$/i, '');
                    const id = await this.saveFile(name, content);
                    resolve({ id, name, content });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // 获取文件统计信息
    async getStats() {
        const files = await this.getAllFiles();
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        return {
            totalFiles: files.length,
            totalSize: totalSize,
            lastModified: files.length > 0 ? files[0].updatedAt : null
        };
    }

    // 清空所有文件
    async clearAll() {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            
            request.onsuccess = () => {
                this.currentFileId = null;
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        // 小于1小时
        if (diff < 3600000) {
            return Math.floor(diff / 60000) + ' 分钟前';
        }
        // 小于24小时
        if (diff < 86400000) {
            return Math.floor(diff / 3600000) + ' 小时前';
        }
        // 小于7天
        if (diff < 604800000) {
            return Math.floor(diff / 86400000) + ' 天前';
        }
        
        // 其他情况显示具体日期
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 导出文件管理器实例
window.fileManager = new FileManager(); 