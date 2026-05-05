// @ts-ignore
import { GM_xmlhttpRequest, GM_setClipboard } from '$';

// --- Configuration & Constants ---
const THEME = {
    primary: '#00aeec',
    primaryHover: '#0095c9',
    secondary: '#61666d',
    bg: 'rgba(255, 255, 255, 0.9)',
    text: '#18191c',
    textMuted: '#9499a0',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: 'rgba(0, 0, 0, 0.05)',
    glass: 'blur(12px)',
    error: '#ff4d4f',
    success: '#52c41a'
};

const VERSION = '0.1.0';

let currentCid: number | null = null;
const logs: any[] = [];

// --- Utility Functions ---

function log(type: string, message: string, data: any = null) {
    const entry = {
        time: new Date().toLocaleTimeString(),
        type,
        message,
        data: data ? (typeof data === 'string' ? data : JSON.stringify(data).substring(0, 500)) : null
    };
    logs.push(entry);
    console.log(`[SubBili][${type}] ${message}`, data || '');
    if (logs.length > 50) logs.shift(); 
}

function secondToSrtTime(seconds: number) {
    if (seconds < 0) return "00:00:00,000";
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${h}:${m}:${s},${ms}`;
}

function bccToSrt(bccJson: any) {
    let srt = "";
    if (!bccJson.body) return "";
    bccJson.body.forEach((item: any, index: number) => {
        srt += `${index + 1}\n`;
        srt += `${secondToSrtTime(item.from)} --> ${secondToSrtTime(item.to)}\n`;
        srt += `${item.content}\n\n`;
    });
    return srt;
}

function downloadFile(content: string, fileName: string, mimeType: string) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log('INFO', `文件已触发下载: ${fileName}`);
    } catch (e: any) {
        log('ERROR', `下载失败: ${e.message}`);
    }
}

function getVideoInfo() {
    try {
        let aid = (window as any).aid;
        let bvid = (window as any).bvid;
        let cid = (window as any).cid;
        let title = "";

        const initialState = (window as any).__INITIAL_STATE__;
        if (initialState) {
            aid = aid || initialState.aid || (initialState.videoData && initialState.videoData.aid);
            bvid = bvid || initialState.bvid || (initialState.videoData && initialState.videoData.bvid);
            cid = cid || initialState.cid || (initialState.videoData && initialState.videoData.cid);
            title = title || (initialState.videoData && initialState.videoData.title);
        }

        if (!cid && initialState && initialState.epInfo) {
            const ep = initialState.epInfo;
            cid = ep.cid;
            aid = ep.aid;
            bvid = ep.bvid;
            title = ep.share_copy || ep.title;
        }

        if ((window as any).player && typeof (window as any).player.getArg === 'function') {
            cid = (window as any).player.getArg('cid') || cid;
            aid = (window as any).player.getArg('aid') || aid;
            bvid = (window as any).player.getArg('bvid') || bvid;
        }

        if (!bvid) {
            const bvidMatch = window.location.href.match(/BV[a-zA-Z0-9]+/);
            if (bvidMatch) bvid = bvidMatch[0];
        }

        title = title || document.title.split('_')[0];
        return { aid, bvid, cid, title };
    } catch (e: any) {
        log('ERROR', `探测视频信息失败: ${e.message}`, e);
        return { aid: null, bvid: null, cid: null, title: "" };
    }
}

async function fetchVideoInfoFallback(bvid: string) {
    log('INFO', `尝试通过 WebAPI 恢复信息: ${bvid}`);
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    return new Promise<any>((resolve) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: { 'Referer': window.location.href, 'Origin': 'https://www.bilibili.com' },
            onload: function(response: any) {
                try {
                    const res = JSON.parse(response.responseText);
                    if (res.code === 0 && res.data) {
                        log('INFO', `恢复成功! CID: ${res.data.cid}`);
                        resolve({
                            aid: res.data.aid,
                            bvid: res.data.bvid,
                            cid: res.data.cid,
                            title: res.data.title
                        });
                    } else { resolve(null); }
                } catch (e) { resolve(null); }
            },
            onerror: () => resolve(null)
        });
    });
}

async function fetchSubtitles(info: any, isRetry = false): Promise<any[]> {
    let { aid, bvid, cid } = info;
    if (!cid && bvid) {
        const recoveryInfo = await fetchVideoInfoFallback(bvid);
        if (recoveryInfo) {
            aid = recoveryInfo.aid;
            cid = recoveryInfo.cid;
            info.title = recoveryInfo.title;
        }
    }
    if (!cid) throw new Error('无法定位 CID 视频信息');

    const url = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid || ''}&bvid=${bvid || ''}`;
    log('INFO', `请求字幕列表... ${isRetry ? '(第二次尝试)' : ''}`);
    return new Promise<any[]>((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: { 
                'Referer': window.location.href,
                'Cache-Control': 'no-cache'
            },
            onload: async function(response: any) {
                try {
                    const res = JSON.parse(response.responseText);
                    if (res.code === 0 && res.data.subtitle && res.data.subtitle.subtitles && res.data.subtitle.subtitles.length > 0) {
                        resolve(res.data.subtitle.subtitles);
                    } else { 
                        if (!isRetry) {
                            log('WARNING', '列表为空，1.5秒后自动重试...');
                            await new Promise(r => setTimeout(r, 1500));
                            resolve(await fetchSubtitles(info, true));
                        } else {
                            resolve([]); 
                        }
                    }
                } catch (e) { reject(e); }
            },
            onerror: (err: any) => reject(err)
        });
    });
}

// --- UI Components ---

function createStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sub-dl-trigger { width: 56px; height: 56px; background: ${THEME.primary}; color: white; border-radius: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.2s; }
        .sub-dl-trigger:hover { background: ${THEME.primaryHover}; transform: scale(1.05); }
        .sub-dl-trigger:active { transform: scale(0.95); }
        .sub-dl-diag-trigger { width: 44px; height: 44px; background: ${THEME.secondary}; color: white; border-radius: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; margin-bottom: 12px; }
        .sub-dl-diag-trigger:hover { background: #4a4d52; transform: scale(1.05); }
        .sub-dl-format-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; border: none; transition: all 0.2s; }
        .sub-dl-format-btn.srt { background: ${THEME.primary}; color: white; }
        .sub-dl-format-btn.bcc { background: #f1f2f3; color: #61666d; }
        .sub-dl-item:hover { background: rgba(0,174,236,0.05); }
        .sub-dl-diag-btn { background: none; border: 1px solid ${THEME.textMuted}; color: ${THEME.textMuted}; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
        .sub-dl-diag-btn:hover { border-color: ${THEME.primary}; color: ${THEME.primary}; }
        .diag-item { font-family: 'Consolas', monospace; font-size: 11px; padding: 6px 12px; border-bottom: 1px solid rgba(0,0,0,0.03); white-space: pre-wrap; word-break: break-all; }
        .diag-type-ERROR { color: ${THEME.error}; }
        .diag-type-INFO { color: ${THEME.primary}; }
    `;
    document.head.appendChild(style);
}

function injectUI() {
    if (document.getElementById('sub-dl-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sub-dl-wrapper';
    wrapper.style.cssText = `position: fixed; bottom: 40px; right: 40px; z-index: 10000; display: flex; flex-direction: column; align-items: center; font-family: sans-serif;`;

    const diagTrigger = document.createElement('div');
    diagTrigger.className = 'sub-dl-diag-trigger';
    diagTrigger.innerHTML = `<i class="fa-solid fa-bug"></i>`;
    diagTrigger.title = "诊断日志";

    const mainTrigger = document.createElement('div');
    mainTrigger.className = 'sub-dl-trigger';
    mainTrigger.innerHTML = `<i class="fa-solid fa-download" style="font-size: 20px;"></i>`;
    mainTrigger.title = "下载字幕";

    const menu = document.createElement('div');
    menu.id = 'sub-dl-menu';
    menu.style.cssText = `position: absolute; bottom: 120px; right: 0; width: 300px; background: ${THEME.bg}; backdrop-filter: ${THEME.glass}; border-radius: 20px; box-shadow: ${THEME.shadow}; border: 1px solid ${THEME.border}; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s;`;

    const diagPanel = document.createElement('div');
    diagPanel.id = 'sub-dl-diag-panel';
    diagPanel.style.cssText = `position: absolute; bottom: 120px; right: 0; width: 320px; background: ${THEME.bg}; backdrop-filter: ${THEME.glass}; border-radius: 20px; box-shadow: ${THEME.shadow}; border: 1px solid ${THEME.border}; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s;`;

    menu.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 16px;">字幕列表</span>
            <i class="fa-solid fa-xmark" id="sub-dl-close-menu" style="cursor: pointer; color: ${THEME.textMuted};"></i>
        </div>
        <div id="sub-dl-list" style="max-height: 320px; overflow-y: auto;"></div>
    `;

    diagPanel.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 16px;">诊断报告</span>
            <div style="display: flex; gap: 8px;">
                <button id="sub-dl-copy" class="sub-dl-diag-btn"><i class="fa-solid fa-copy"></i> 复制</button>
                <button id="sub-dl-clear" class="sub-dl-diag-btn"><i class="fa-solid fa-trash-can"></i> 清空</button>
                <i class="fa-solid fa-xmark" id="sub-dl-close-diag" style="cursor: pointer; color: ${THEME.textMuted}; margin-left: 8px;"></i>
            </div>
        </div>
        <div id="sub-dl-logs-box" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.02);"></div>
    `;

    wrapper.appendChild(diagPanel);
    wrapper.appendChild(menu);
    wrapper.appendChild(diagTrigger);
    wrapper.appendChild(mainTrigger);
    document.body.appendChild(wrapper);

    mainTrigger.onclick = async (e) => {
        e.stopPropagation();
        diagPanel.style.display = 'none';
        if (menu.style.display === 'flex') { menu.style.display = 'none'; return; }
        menu.style.display = 'flex';
        const list = document.getElementById('sub-dl-list');
        if (!list) return;
        list.innerHTML = '<div style="padding: 30px; text-align: center; color: #9499a0;"><i class="fa-solid fa-circle-notch fa-spin"></i> 正在嗅探...</div>';
        
        try {
            const info = getVideoInfo();
            const subs = await fetchSubtitles(info);
            if (subs.length === 0) { list.innerHTML = '<div style="padding: 30px; text-align: center; color: #9499a0;">暂无字幕数据</div>'; return; }
            list.innerHTML = '';
            subs.forEach(s => {
                const item = document.createElement('div');
                item.className = 'sub-dl-item';
                item.style.cssText = `padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.02);`;
                item.innerHTML = `
                    <div><div style="font-weight: bold; font-size: 14px;">${s.lan_doc}</div><div style="font-size: 11px; color: ${THEME.textMuted};">${s.lan}</div></div>
                    <div style="display: flex; gap: 6px;">
                        <button class="sub-dl-format-btn srt">SRT</button>
                        <button class="sub-dl-format-btn bcc">BCC</button>
                    </div>
                `;
                (item.querySelector('.srt') as HTMLElement).onclick = () => downloadSubtitle(s.subtitle_url, `${info.title}_${s.lan_doc}.srt`, 'srt');
                (item.querySelector('.bcc') as HTMLElement).onclick = () => downloadSubtitle(s.subtitle_url, `${info.title}_${s.lan_doc}.bcc`, 'bcc');
                list.appendChild(item);
            });
        } catch (err: any) {
            list.innerHTML = `<div style="padding: 20px; text-align: center; color: ${THEME.error}; font-size: 13px;">探测失败: ${err.message}</div>`;
        }
    };

    diagTrigger.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        diagPanel.style.display = diagPanel.style.display === 'none' ? 'flex' : 'none';
        if (diagPanel.style.display === 'flex') renderLogs();
    };

    (document.getElementById('sub-dl-close-menu') as HTMLElement).onclick = () => menu.style.display = 'none';
    (document.getElementById('sub-dl-close-diag') as HTMLElement).onclick = () => diagPanel.style.display = 'none';
    (document.getElementById('sub-dl-clear') as HTMLElement).onclick = () => { logs.length = 0; renderLogs(); };
    (document.getElementById('sub-dl-copy') as HTMLElement).onclick = (e: any) => {
        const header = `--- SubBili Diagnostic Report ---\nVersion: V${VERSION}\nURL: ${window.location.href}\nUA: ${navigator.userAgent}\nTime: ${new Date().toLocaleString()}\n------------------------------\n`;
        const content = logs.map(l => `[${l.time}] [${l.type}] ${l.message} ${l.data || ''}`).join('\n');
        GM_setClipboard(header + content);
        e.target.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
        setTimeout(() => e.target.innerHTML = '<i class="fa-solid fa-copy"></i> 复制', 2000);
    };
}

function renderLogs() {
    const box = document.getElementById('sub-dl-logs-box');
    if (!box) return;
    box.innerHTML = logs.length === 0 ? '<div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">暂无日志</div>' : '';
    logs.forEach(l => {
        const item = document.createElement('div');
        item.className = 'diag-item';
        item.innerHTML = `<span style="color: #999;">[${l.time}]</span> <span class="diag-type-${l.type}">[${l.type}]</span> ${l.message}`;
        box.appendChild(item);
    });
    box.scrollTop = box.scrollHeight;
}

async function downloadSubtitle(url: string, fileName: string, format: string, isAnonymous = false) {
    if (url.startsWith('//')) url = 'https:' + url;
    else if (url.startsWith('/')) url = 'https://i0.hdslb.com' + url;
    
    const finalUrl = url; 
    // Subtitle URLs with auth_key often redirect if Referer is the video page.
    // We should use no-referrer to bypass this.
    
    log('INFO', `开始导出: ${fileName}${isAnonymous ? ' (匿名模式)' : ''}`);

    const processContent = (text: string) => {
        if (text.trim().startsWith('<')) {
            throw new Error(`服务器返回了 HTML 页面。内容摘要: ${text.substring(0, 100)}`);
        }
        if (format === 'srt') {
            downloadFile(bccToSrt(JSON.parse(text)), fileName, 'text/plain');
        } else {
            downloadFile(text, fileName, 'application/json');
        }
    };

    if (!isAnonymous) {
        try {
            log('INFO', '尝试使用原生 Fetch...');
            const resp = await fetch(finalUrl, { 
                credentials: 'include',
                referrerPolicy: 'no-referrer'
            });
            if (resp.ok) {
                const text = await resp.text();
                processContent(text);
                return;
            }
        } catch (e) {
            log('INFO', '原生 Fetch 被拦截');
        }
    }

    const headers = { 
        'Referer': 'https://www.bilibili.com/',
        'User-Agent': navigator.userAgent
    };

    GM_xmlhttpRequest({
        method: "GET",
        url: finalUrl,
        anonymous: true,
        headers: headers,
        onload: function(response: any) {
            const text = response.responseText || "";
            try {
                if (response.finalUrl && response.finalUrl.includes('bilibili.com/video/')) {
                    if (!isAnonymous) {
                        log('WARNING', '标准请求被重定向，尝试匿名模式...');
                        downloadSubtitle(url, fileName, format, true);
                        return;
                    }
                    throw new Error('下载请求被重定向至视频详情页');
                }
                if (response.status !== 200 || text.trim().startsWith('<')) {
                    throw new Error(`服务器返回异常 (HTTP ${response.status})`);
                }
                processContent(text);
            } catch (e: any) {
                log('ERROR', `处理失败: ${e.message}`);
                alert('导出失败: ' + e.message);
            }
        },
        onerror: (err: any) => {
            log('ERROR', `网络请求失败`, err);
            alert('下载请求被拦截或超时');
        }
    });
}

createStyle();
log('INFO', `Script initialized V${VERSION} (Build Mode)`);
setInterval(() => {
    const info = getVideoInfo();
    if (info.cid && info.cid !== currentCid) {
        currentCid = info.cid;
        log('INFO', `切换至 CID: ${currentCid}`);
    }
    injectUI();
}, 2000);
