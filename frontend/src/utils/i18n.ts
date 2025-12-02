export const locales = {
    'zh-CN': {
        'upload.title': '上传采购数据',
        'upload.drag': '点击或拖拽文件到此区域上传',
        'upload.hint': '支持 .xlsx 或 .csv 格式',
        'upload.processing': '正在解析文件...',
        'mapping.title': '确认字段映射',
        'mapping.desc': '系统已自动匹配字段，请确认或手动修正。',
        'mapping.original': '原始表头',
        'mapping.target': '目标字段',
        'mapping.confidence': '置信度',
        'mapping.sample': '示例数据',
        'mapping.confirm': '确认并入库',
        'mapping.cancel': '取消',
        'mapping.success': '数据入库成功！',
        'common.error': '发生错误',
    },
    'en-US': {
        'upload.title': 'Upload Procurement Data',
        'upload.drag': 'Click or drag file to this area to upload',
        'upload.hint': 'Support .xlsx or .csv format',
        'upload.processing': 'Parsing file...',
        'mapping.title': 'Confirm Field Mapping',
        'mapping.desc': 'System has automatically matched fields, please confirm or correct.',
        'mapping.original': 'Original Header',
        'mapping.target': 'Target Field',
        'mapping.confidence': 'Confidence',
        'mapping.sample': 'Sample Data',
        'mapping.confirm': 'Confirm & Import',
        'mapping.cancel': 'Cancel',
        'mapping.success': 'Data imported successfully!',
        'common.error': 'An error occurred',
    }
};

export type Lang = 'zh-CN' | 'en-US';

export const t = (key: keyof typeof locales['zh-CN'], lang: Lang = 'zh-CN') => {
    return locales[lang][key] || key;
};
