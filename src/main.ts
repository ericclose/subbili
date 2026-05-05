// @ts-ignore
import { GM_xmlhttpRequest, GM_setClipboard } from '$';

// --- Configuration & Constants ---
const ICONS = {
    download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a3.375 3.375 0 0 0 3.375 3.375h9.75a3.375 3.375 0 0 0 3.375-3.375V16.5a.75.75 0 0 1 1.5 0v2.25a4.875 4.875 0 0 1-4.875 4.875H7.125A4.875 4.875 0 0 1 2.25 18.75V16.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>`,
    bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px;"><path fill-rule="evenodd" d="M11.097 1.515a.75.75 0 0 1 .589.882L10.666 7.5h2.668l-.92-5.103a.75.75 0 1 1 1.472.265l1.02 5.655.162.9a.75.75 0 0 1-.741.883h-4.854a.75.75 0 0 1-.74-.883l.161-.9 1.021-5.655a.75.75 0 0 1 .882-.589ZM8.273 4.45a.75.75 0 0 1 .311 1.013l-2.5 4.33a.75.75 0 1 1-1.299-.75l2.475-4.282a.75.75 0 0 1 1.013-.311Zm7.454 0a.75.75 0 0 1 1.013.311l2.475 4.282a.75.75 0 1 1-1.299.75l-2.5-4.33a.75.75 0 0 1 .311-1.013ZM4.87 11.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm14.26 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM3.795 15.51a.75.75 0 0 1 1.012-.312l2.475 4.282a.75.75 0 1 1-1.299.75l-2.5-4.33a.75.75 0 0 1 .312-1.01Zm16.41 0a.75.75 0 0 1 .312 1.01l-2.5 4.33a.75.75 0 1 1-1.299-.75l2.475-4.282a.75.75 0 0 1 1.012.312ZM12 7.5a6 6 0 0 1 6 6v1.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6v-1.5a6 6 0 0 1 6-6Z" clip-rule="evenodd" /></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;"><path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" /><path d="M4.5 7.125A1.875 1.875 0 0 0 2.625 9v9a3.75 3.75 0 0 0 3.75 3.75h9a1.875 1.875 0 0 0 1.875-1.875V16.5H6.375a3.375 3.375 0 0 1-3.375-3.375V7.125H4.5Z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0v8.25a.75.75 0 0 0 1.5 0v-8.25Zm4.5 0a.75.75 0 1 0-1.5 0v8.25a.75.75 0 0 0 1.5 0v-8.25Z" clip-rule="evenodd" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>`,
    loading: `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path></svg>`
};

const THEME = {
    primary: '#00aeec',
    primaryHover: '#0095c9',
    secondary: '#f59e0b',
    secondaryHover: '#d97706',
    bg: 'rgba(255, 255, 255, 0.9)',
    text: '#18191c',
    textMuted: '#9499a0',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: 'rgba(0, 0, 0, 0.05)',
    glass: 'blur(12px)',
    error: '#ff4d4f',
    success: '#52c41a'
};

const VERSION = '0.1.3';

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

async function fetchSubtitles(info: any, retryCount = 0): Promise<any[]> {
    let { aid, bvid, cid } = info;
    const maxRetries = 2;

    if (!cid && bvid) {
        const recoveryInfo = await fetchVideoInfoFallback(bvid);
        if (recoveryInfo) {
            aid = recoveryInfo.aid;
            cid = recoveryInfo.cid;
            info.title = recoveryInfo.title;
        }
    }
    if (!cid) throw new Error('无法定位 CID 视频信息');

    const v2Url = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid || ''}&bvid=${bvid || ''}`;
    log('INFO', `请求字幕列表 (V2 API)... ${retryCount > 0 ? `(第 ${retryCount} 次重试)` : ''}`);

    const tryV2 = () => new Promise<any[]>((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: v2Url,
            headers: { 'Referer': window.location.href, 'Cache-Control': 'no-cache' },
            onload: (response: any) => {
                try {
                    const res = JSON.parse(response.responseText);
                    if (res.code === 0 && res.data?.subtitle?.subtitles?.length > 0) {
                        resolve(res.data.subtitle.subtitles);
                    } else { resolve([]); }
                } catch (e) { resolve([]); }
            },
            onerror: () => resolve([])
        });
    });

    const tryView = () => new Promise<any[]>((resolve) => {
        const viewUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid || ''}&aid=${aid || ''}`;
        log('INFO', `尝试从 View API 获取字幕...`);
        GM_xmlhttpRequest({
            method: "GET",
            url: viewUrl,
            headers: { 'Referer': window.location.href },
            onload: (response: any) => {
                try {
                    const res = JSON.parse(response.responseText);
                    if (res.code === 0 && res.data?.subtitle?.list?.length > 0) {
                        // Adapt View API format to V2 format
                        const mapped = res.data.subtitle.list.map((s: any) => ({
                            lan: s.lan,
                            lan_doc: s.lan_doc,
                            subtitle_url: s.subtitle_url
                        }));
                        resolve(mapped);
                    } else { resolve([]); }
                } catch (e) { resolve([]); }
            },
            onerror: () => resolve([])
        });
    });

    let subs = await tryV2();
    if (subs.length === 0 && bvid) {
        subs = await tryView();
    }

    if (subs.length === 0 && retryCount < maxRetries) {
        log('WARNING', `未发现字幕，${1.5 * (retryCount + 1)}s 后重试...`);
        await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
        return fetchSubtitles(info, retryCount + 1);
    }

    return subs;
}

// --- UI Components ---

function createStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .sub-dl-trigger { width: 52px; height: 52px; background: ${THEME.primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.2s; border: none; }
        .sub-dl-trigger:hover { background: ${THEME.primaryHover}; transform: scale(1.05); }
        .sub-dl-trigger:active { transform: scale(0.95); }
        .sub-dl-diag-trigger { width: 52px; height: 52px; background: ${THEME.secondary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; margin-bottom: 12px; border: none; }
        .sub-dl-diag-trigger:hover { background: ${THEME.secondaryHover}; transform: scale(1.05); }
        .sub-dl-format-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; border: none; transition: all 0.2s; }
        .sub-dl-format-btn.srt { background: ${THEME.primary}; color: white; }
        .sub-dl-format-btn.bcc { background: #f1f2f3; color: #61666d; }
        .sub-dl-item:hover { background: rgba(0,174,236,0.05); }
        .sub-dl-diag-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: 1px solid ${THEME.textMuted}; color: ${THEME.textMuted}; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
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

    const diagTrigger = document.createElement('button');
    diagTrigger.className = 'sub-dl-diag-trigger';
    diagTrigger.innerHTML = ICONS.bug;
    diagTrigger.title = "诊断日志";

    const mainTrigger = document.createElement('button');
    mainTrigger.className = 'sub-dl-trigger';
    mainTrigger.innerHTML = ICONS.download;
    mainTrigger.title = "下载字幕";

    const menu = document.createElement('div');
    menu.id = 'sub-dl-menu';
    menu.style.cssText = `position: absolute; bottom: 130px; right: 0; width: 300px; background: ${THEME.bg}; backdrop-filter: ${THEME.glass}; border-radius: 20px; box-shadow: ${THEME.shadow}; border: 1px solid ${THEME.border}; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s;`;

    const diagPanel = document.createElement('div');
    diagPanel.id = 'sub-dl-diag-panel';
    diagPanel.style.cssText = `position: absolute; bottom: 130px; right: 0; width: 320px; background: ${THEME.bg}; backdrop-filter: ${THEME.glass}; border-radius: 20px; box-shadow: ${THEME.shadow}; border: 1px solid ${THEME.border}; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s;`;

    menu.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 16px;">字幕列表</span>
            <div id="sub-dl-close-menu" style="cursor: pointer; color: ${THEME.textMuted}; display: flex;">${ICONS.x}</div>
        </div>
        <div id="sub-dl-list" style="max-height: 320px; overflow-y: auto;"></div>
    `;

    diagPanel.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 16px;">诊断报告</span>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button id="sub-dl-copy" class="sub-dl-diag-btn">${ICONS.copy} 复制</button>
                <button id="sub-dl-clear" class="sub-dl-diag-btn">${ICONS.trash} 清空</button>
                <div id="sub-dl-close-diag" style="cursor: pointer; color: ${THEME.textMuted}; margin-left: 4px; display: flex;">${ICONS.x}</div>
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
        list.innerHTML = `<div style="padding: 30px; text-align: center; color: #9499a0; display: flex; flex-direction: column; align-items: center; gap: 8px;">${ICONS.loading} 正在嗅探...</div>`;
        
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
    (document.getElementById('sub-dl-copy') as HTMLElement).onclick = () => {
        const header = `--- SubBili Diagnostic Report ---\nVersion: V${VERSION}\nURL: ${window.location.href}\nUA: ${navigator.userAgent}\nTime: ${new Date().toLocaleString()}\n------------------------------\n`;
        const content = logs.map(l => `[${l.time}] [${l.type}] ${l.message} ${l.data || ''}`).join('\n');
        GM_setClipboard(header + content);
        const btn = document.getElementById('sub-dl-copy') as HTMLElement;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `${ICONS.check} 已复制`;
        setTimeout(() => btn.innerHTML = originalHtml, 2000);
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
