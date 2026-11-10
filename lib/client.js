window.__ModuleLoader__.load({
  id: "dsh-robomaster-boot",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const React = require('react');

    const PKG_NAME = "dsh-robomaster-boot";
    const PATCH_ID = "boot-robomaster";
    const ROUTE_PREFIX = "/robomaster-boot";
    const MODE_KEY = "dsh-rm-boot:mode";
    const SOUND_KEY = "dsh-rm-boot:sound";
    const PEER_MODE_KEY = "dsh-langya-boot:mode";
    const LEGACY_550C_KEY = 'dsh-550c-boot:mode';
    const DEFAULT_MODE = "off";
    const MODE_VALUES = ['off', 'simple', 'full', 'video'];

    const FIRST_FRAME_GLOBAL = "__dshRmOfficialFirstFrame";
    const VERSION_GLOBAL = "__dshRmOfficialVersion";
    const STATE_GLOBAL = "__dshRmOfficialState";
    const HOST_CLASS = "dshrm-official-host";

    const TITLE_ZH = "RoboMaster \u5f00\u673a\u52a8\u753b\uff08\u5b98\u65b9 Logo \u7248\uff09";
    const DESC_ZH = "启动时播放 RoboMaster 机甲大师战术全息开机动画（红警风全息雷达投影 + 7 大兵种高燃名场面 + 14 个研发组别工程弹窗）；点击画面或按 Esc 跳过。";
    const GENERAL_ORDER = 24;
    const SERIES_ORDER = 45;

    const FADE_MS = 620;
    const SYNC_EVENT = 'dsh-rm-boot-sync';
    const HOST_SHEET_ID = PKG_NAME + '-host-style';
    const ROW_STYLE_ID = 'dsh-rm-boot-shared-row-style';
    const CAPTION_STYLE_ID = PKG_NAME + '-caption-style';

    function pluginState() {
      if (window[STATE_GLOBAL] && typeof window[STATE_GLOBAL] === 'object') {
        return window[STATE_GLOBAL];
      }
      const init = { applied: false, splashPlayed: false };
      window[STATE_GLOBAL] = init;
      return init;
    }

    function readMode() {
      try {
        const raw = window.localStorage.getItem(MODE_KEY);
        if (raw === null || raw === '') return DEFAULT_MODE;
        return MODE_VALUES.indexOf(raw) >= 0 ? raw : DEFAULT_MODE;
      } catch {
        return DEFAULT_MODE;
      }
    }

    function writeMode(mode) {
      try {
        window.localStorage.setItem(MODE_KEY, mode);
        if (mode !== 'off') {
          // Automatically set the sibling RoboMaster edition and 550C boot to 'off' so two boot screens never collide
          window.localStorage.setItem(PEER_MODE_KEY, 'off');
          window.localStorage.setItem(LEGACY_550C_KEY, 'off');
        }
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      } catch {
        /* ignore storage error */
      }
    }

    function readSound() {
      try {
        const raw = window.localStorage.getItem(SOUND_KEY);
        return raw === null ? true : raw !== '0';
      } catch {
        return true;
      }
    }

    function writeSound(on) {
      try {
        window.localStorage.setItem(SOUND_KEY, on ? '1' : '0');
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      } catch {
        /* ignore */
      }
    }

    const HOST_SHEET_CSS = [
      'body>.' + HOST_CLASS + '{position:fixed;inset:0;display:block;box-sizing:border-box;z-index:2147483000 !important;background:#050403;pointer-events:auto !important;opacity:1}',
      'body>.' + HOST_CLASS + '.dshrm-out{opacity:0;transition:opacity 420ms cubic-bezier(.4,0,.2,1) 200ms !important;pointer-events:none !important}',
      'html[data-platform="darwin"] body>.' + HOST_CLASS + '{-webkit-app-region:initial !important}',
      'body>.' + HOST_CLASS + '-dragband{position:fixed;top:0;left:0;right:0;height:40px;z-index:2147483001;-webkit-app-region:drag}',
    ].join('\n');

    function ensureHostSheet() {
      if (document.getElementById(HOST_SHEET_ID) !== null) return;
      const style = document.createElement('style');
      style.id = HOST_SHEET_ID;
      style.textContent = HOST_SHEET_CSS;
      document.head.appendChild(style);
    }

    const ROW_CSS = [
      '.dshrm-row{display:flex;align-items:center;gap:16px;padding:12px 0;flex-wrap:wrap;min-width:0;max-width:100%;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.16))}',
      '.dshrm-row:last-child{border-bottom:0}',
      '.dshrm-row-text{flex:1;min-width:240px}',
      '.dshrm-row-title{font-size:13.5px;font-weight:600;line-height:1.5;color:var(--dsw-alias-label-primary,#191919);display:flex;align-items:center;gap:8px}',
      '.dshrm-row-badge{font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;background:rgba(232,160,32,.16);color:#e8a020;border:1px solid rgba(232,160,32,.35)}',
      '.dshrm-row-desc{margin-top:3px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,#666)}',
      '.dshrm-row-ctrl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.dshrm-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:8px;overflow:hidden}',
      '.dshrm-seg button{border:0;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 12px;cursor:pointer;transition:background .15s,color .15s}',
      '.dshrm-seg button+button{border-left:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35))}',
      '.dshrm-seg button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}',
      '.dshrm-seg button.on{background:#111;color:#ffc043;font-weight:600}',
      '.dshrm-btn{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));background:transparent;color:var(--dsw-alias-label-primary,#191919);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 13px;border-radius:8px;cursor:pointer}',
      '.dshrm-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}',
      '.dshrm-btn.primary{border-color:rgba(232,160,32,.55);color:#e8a020;font-weight:600}',
    ].join('\n');

    function ensureRowStyle() {
      if (document.getElementById(ROW_STYLE_ID) !== null) return;
      const style = document.createElement('style');
      style.id = ROW_STYLE_ID;
      style.textContent = ROW_CSS;
      document.head.appendChild(style);
    }

    function endFirstFrame() {
      const handle = window[FIRST_FRAME_GLOBAL];
      if (handle === undefined || handle === null) return;
      delete window[FIRST_FRAME_GLOBAL];
      try {
        handle.end();
      } catch (err) {
        console.error('[' + PKG_NAME + '] first frame end error', err);
      }
    }

    function adaptCaption(host) {
      const platform = document.documentElement.dataset.platform;
      if (platform === undefined || platform === '') return null;
      if (platform === 'darwin') return null;

      const style = document.createElement('style');
      style.id = CAPTION_STYLE_ID;
      const probe = 'body>span[style*="dsw-specific-sidebar-fill"]';
      style.textContent = probe + '{background-color:transparent !important;color:#e8a020 !important}';
      document.head.appendChild(style);
      return () => {
        style.remove();
      };
    }

    let liveOverlay = null;
    let pluginTornDown = false;

    function mountOverlay(force, overrideMode) {
      const st = pluginState();
      if (force !== true) {
        if (st.splashPlayed === true) return null;
        st.splashPlayed = true;
      }
      if (liveOverlay !== null) {
        if (force === true) {
          liveOverlay.dispose();
        } else {
          return liveOverlay;
        }
      }

      const stored = overrideMode || readMode();
      if (!force && stored === 'off') {
        endFirstFrame();
        return null;
      }
      const mode = stored === 'off' ? 'full' : stored;
      const sound = readSound();

      if (document.body === null) {
        document.addEventListener('DOMContentLoaded', () => mountOverlay(force, overrideMode), { once: true });
        return null;
      }

      ensureHostSheet();
      const host = document.createElement('div');
      host.className = HOST_CLASS;
      host.setAttribute('aria-hidden', 'true');

      const dragBand = document.createElement('div');
      dragBand.className = HOST_CLASS + '-dragband';
      dragBand.setAttribute('data-window-drag', '');

      document.body.appendChild(host);
      document.body.appendChild(dragBand);

      const shadow = host.attachShadow({ mode: 'open' });
      const innerStyle = document.createElement('style');
      innerStyle.textContent = [
        ':host{position:fixed;inset:0;background:#050403;overflow:hidden;display:flex;align-items:center;justify-content:center}',
        '.stage-wrap{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#050403;overflow:hidden;transition:opacity 200ms ease-out}',
        ':host(.dshrm-out) .stage-wrap{opacity:0}',
        'iframe{width:1920px;height:1080px;border:0;display:block;flex-shrink:0;transform-origin:center center;background:#050403;box-shadow:0 0 80px rgba(0,0,0,.95)}',
        'video{width:100vw;height:100vh;object-fit:contain;display:block;background:#050403;cursor:pointer}',
        '.skip-pill{position:fixed;right:28px;bottom:18px;z-index:30;font-family:"Cascadia Mono",Consolas,"Microsoft YaHei UI",monospace;font-size:12px;letter-spacing:.08em;color:rgba(255,192,67,.65);background:rgba(5,4,3,.76);border:1px solid rgba(232,160,32,.32);padding:5px 12px;border-radius:4px;cursor:pointer;user-select:none}',
        '.skip-pill:hover{color:#ffc043;border-color:#ffc043}',
      ].join('\n');
      shadow.appendChild(innerStyle);

      const wrap = document.createElement('div');
      wrap.className = 'stage-wrap';
      shadow.appendChild(wrap);

      const captionDispose = adaptCaption(host);

      const record = {
        host,
        dragBand,
        finished: false,
        fadeTimer: null,
        watchdog: null,
        msgHandler: null,
        keyHandler: null,
        resizeHandler: null,
        videoEl: null,
        dispose: null,
        finish: null,
      };

      record.dispose = () => {
        if (record.fadeTimer !== null) window.clearTimeout(record.fadeTimer);
        if (record.watchdog !== null) window.clearTimeout(record.watchdog);
        if (record.msgHandler !== null) window.removeEventListener('message', record.msgHandler);
        if (record.keyHandler !== null) window.removeEventListener('keydown', record.keyHandler, true);
        if (record.resizeHandler !== null) window.removeEventListener('resize', record.resizeHandler);
        if (record.videoEl !== null) {
          try {
            record.videoEl.pause();
            record.videoEl.removeAttribute('src');
            record.videoEl.load();
          } catch {}
        }
        if (captionDispose !== null) captionDispose();
        dragBand.remove();
        host.remove();
        if (liveOverlay === record) liveOverlay = null;
      };

      record.finish = () => {
        if (record.finished) return;
        record.finished = true;
        if (record.watchdog !== null) {
          window.clearTimeout(record.watchdog);
          record.watchdog = null;
        }
        host.classList.add('dshrm-out');
        record.fadeTimer = window.setTimeout(record.dispose, FADE_MS + 40);
      };

      record.keyHandler = (ev) => {
        if (ev.key === 'Escape') {
          ev.preventDefault();
          record.finish();
        }
      };
      window.addEventListener('keydown', record.keyHandler, true);

      const maxWatchdogMs = mode === 'simple' ? 8000 : 28000;
      record.watchdog = window.setTimeout(() => record.finish(), maxWatchdogMs);

      if (mode === 'video') {
        const video = document.createElement('video');
        video.src = ROUTE_PREFIX + '/boot.mp4';
        video.playsInline = true;
        video.preload = 'auto';
        video.muted = !sound;
        video.volume = 0.88;
        record.videoEl = video;

        const pill = document.createElement('div');
        pill.className = 'skip-pill';
        pill.textContent = 'CLICK / ESC 跳过开机动画';

        video.addEventListener('ended', () => record.finish());
        video.addEventListener('error', () => record.finish());
        video.addEventListener('click', () => record.finish());
        pill.addEventListener('click', () => record.finish());

        wrap.appendChild(video);
        wrap.appendChild(pill);

        const p = video.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // Fallback to muted autoplay if browser gesture policy blocks unmuted
            video.muted = true;
            video.play().catch(() => record.finish());
          });
        }
        endFirstFrame();
      } else {
        const iframe = document.createElement('iframe');
        iframe.src = ROUTE_PREFIX + '/stage.html?mode=' + encodeURIComponent(mode) + '&sound=' + (sound ? '1' : '0');
        iframe.setAttribute('title', TITLE_ZH);
        const updateScale = () => {
          const vw = window.innerWidth || 1920;
          const vh = window.innerHeight || 1080;
          const s = Math.min(vw / 1920, vh / 1080);
          iframe.style.transform = 'scale(' + s.toFixed(5) + ')';
        };
        updateScale();
        record.resizeHandler = updateScale;
        window.addEventListener('resize', updateScale);
        wrap.appendChild(iframe);

        record.msgHandler = (ev) => {
          const data = ev.data;
          if (!data || typeof data !== 'object' || data.plugin !== PKG_NAME) return;
          if (data.type === 'dsh-rm-boot:ready') {
            endFirstFrame();
          } else if (data.type === 'dsh-rm-boot:done') {
            record.finish();
          }
        };
        window.addEventListener('message', record.msgHandler);
        iframe.addEventListener('load', () => endFirstFrame());
        iframe.addEventListener('error', () => {
          endFirstFrame();
          record.finish();
        });
      }

      liveOverlay = record;
      return record;
    }

    function SettingsRow() {
      const [mode, setMode] = React.useState(readMode);
      const [sound, setSound] = React.useState(readSound);
      const version = typeof window[VERSION_GLOBAL] === 'string' ? window[VERSION_GLOBAL] : '1.0.0';

      React.useEffect(() => {
        ensureRowStyle();
        const onSync = () => {
          setMode(readMode());
          setSound(readSound());
        };
        window.addEventListener(SYNC_EVENT, onSync);
        return () => window.removeEventListener(SYNC_EVENT, onSync);
      }, []);

      const chooseMode = (next) => {
        writeMode(next);
        setMode(next);
      };

      const toggleSound = () => {
        const next = !sound;
        writeSound(next);
        setSound(next);
      };

      const options = [
        { value: 'off', label: '关闭' },
        { value: 'simple', label: '简易 (仅Logo)' },
        { value: 'full', label: '完整 (实时引擎)' },
        { value: 'video', label: '超清视频 (MP4)' },
      ];

      return React.createElement(
        'div',
        { className: 'dshrm-row' },
        React.createElement(
          'div',
          { className: 'dshrm-row-text' },
          React.createElement(
            'div',
            { className: 'dshrm-row-title' },
            TITLE_ZH,
            React.createElement('span', { className: 'dshrm-row-badge' }, 'v' + version),
          ),
          React.createElement('div', { className: 'dshrm-row-desc' }, DESC_ZH),
        ),
        React.createElement(
          'div',
          { className: 'dshrm-row-ctrl' },
          React.createElement(
            'div',
            { className: 'dshrm-seg' },
            options.map((opt) =>
              React.createElement(
                'button',
                {
                  key: opt.value,
                  type: 'button',
                  className: mode === opt.value ? 'on' : '',
                  onClick: () => chooseMode(opt.value),
                },
                opt.label,
              ),
            ),
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'dshrm-btn',
              onClick: toggleSound,
              title: '切换开机动画配乐与音效',
            },
            sound ? '🔊 声音: 开' : '🔇 声音: 关',
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'dshrm-btn primary',
              onClick: () => mountOverlay(true, mode === 'off' ? 'full' : mode),
            },
            '▶ 立即预览',
          ),
        ),
      );
    }

    function installSettingsRows(ctx) {
      let inGeneral = null;
      let onSeries = null;

      const placeInGeneral = () => {
        const dispose = ctx.slots.register(
          { name: 'settings.general.item', id: PATCH_ID, order: GENERAL_ORDER },
          SettingsRow,
        );
        inGeneral = () => dispose();
      };

      const placeOnSeries = () => {
        const dispose = ctx.slots.register(
          { name: 'settings.550c.anim.550c', id: PATCH_ID, order: SERIES_ORDER },
          SettingsRow,
        );
        onSeries = () => dispose();
      };

      // Register in General settings so it is always easy to find, AND in 550C tab if present
      ctx.slots.inject('settings.general.item', () => {
        placeInGeneral();
        return () => {
          inGeneral?.();
          inGeneral = null;
        };
      });

      ctx.slots.inject('settings.550c.anim.550c', () => {
        placeOnSeries();
        return () => {
          onSeries?.();
          onSeries = null;
        };
      });
    }

    function apply(ctx) {
      const st = pluginState();
      if (st.applied === true) return;
      st.applied = true;

      installSettingsRows(ctx);

      ctx.effect(
        () => () => {
          pluginTornDown = true;
          if (bootSplash !== null) bootSplash.dispose();
          if (liveOverlay !== null) liveOverlay.dispose();
        },
        PKG_NAME + ': teardown',
      );
    }

    const bootSplash = mountOverlay(false);

    exports.name = PATCH_ID;
    exports.inject = ['slots'];
    exports.apply = apply;
    return module.exports;
  },
});
