import { Head, Html, Main, NextScript } from "next/document";

const GTM_ID = "GTM-PSMPHVW5";

export default function Document() {
  return (
    <Html lang="cs">
      <Head>
        <script
          id="google-consent-default-document"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
(function(){
  var analytics = 'denied';
  var marketing = 'denied';
  try {
    analytics = localStorage.getItem('archimedes-analytics-consent') === 'granted' ? 'granted' : 'denied';
    marketing = localStorage.getItem('archimedes-marketing-consent') === 'granted' ? 'granted' : 'denied';
  } catch (e) {}
  gtag('consent', 'default', {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    wait_for_update: 500
  });
  window.dataLayer.push({
    event: 'consent_initial_state',
    analytics_consent: analytics,
    marketing_consent: marketing
  });
})();`,
          }}
        />
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        <script
          id="archimedes-tracking-and-consent"
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var ANALYTICS_KEY = 'archimedes-analytics-consent';
  var MARKETING_KEY = 'archimedes-marketing-consent';

  function read(key) {
    try { return localStorage.getItem(key) === 'granted' ? 'granted' : 'denied'; }
    catch (e) { return 'denied'; }
  }

  function push(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }

  function updateConsent(analytics, marketing) {
    try {
      localStorage.setItem(ANALYTICS_KEY, analytics);
      localStorage.setItem(MARKETING_KEY, marketing);
    } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: analytics,
        ad_storage: marketing,
        ad_user_data: marketing,
        ad_personalization: marketing
      });
    }
    push('consent_update', {
      analytics_consent: analytics,
      marketing_consent: marketing
    });
  }

  window.archimedesConsent = {
    get: function(){ return { analytics: read(ANALYTICS_KEY), marketing: read(MARKETING_KEY) }; },
    set: updateConsent
  };

  function classifyLink(link) {
    var href = link.getAttribute('href') || '';
    var text = (link.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 120);
    var path = window.location.pathname;
    if (href.indexOf('mailto:') === 0) return ['contact_click', { contact_type: 'email', link_text: text, page_path: path }];
    if (href.indexOf('tel:') === 0) return ['contact_click', { contact_type: 'phone', link_text: text, page_path: path }];
    if (link.hasAttribute('download') || /\\.(pdf|docx?|xlsx?|zip)(\\?|#|$)/i.test(href)) return ['download_brochure', { file_url: href, link_text: text, page_path: path }];
    if (href.indexOf('/poptavka-ucebny') !== -1) return ['request_classroom_start', { link_url: href, link_text: text, page_path: path }];
    if (href.indexOf('/zadost') !== -1 || /chci se zapojit|připojte se|objednat/i.test(text)) return ['generate_lead_start', { link_url: href, link_text: text, page_path: path }];
    if (/registrace|create-organization|welcome|join/.test(href)) return ['registration_start', { link_url: href, link_text: text, page_path: path }];
    return null;
  }

  document.addEventListener('click', function(event){
    var link = event.target && event.target.closest ? event.target.closest('a') : null;
    if (!link) return;
    var classified = classifyLink(link);
    if (classified) push(classified[0], classified[1]);
  }, true);

  document.addEventListener('play', function(event){
    var video = event.target;
    if (!video || video.tagName !== 'VIDEO' || video.dataset.archimedesTrackedPlay === '1') return;
    video.dataset.archimedesTrackedPlay = '1';
    push('video_play', {
      video_src: video.currentSrc || video.getAttribute('src') || '',
      page_path: window.location.pathname
    });
  }, true);

  document.addEventListener('submit', function(event){
    var form = event.target;
    var path = window.location.pathname;
    var eventName = 'form_submit';
    if (path.indexOf('/poptavka-ucebny') !== -1) eventName = 'request_classroom_submit';
    else if (path.indexOf('/zadost') !== -1) eventName = 'generate_lead_submit';
    else if (/registrace|create-organization|welcome|join/.test(path)) eventName = 'registration_submit';
    push(eventName, {
      form_id: form && form.id ? form.id : '',
      form_name: form && form.getAttribute ? (form.getAttribute('name') || '') : '',
      page_path: path
    });
  }, true);

  function createCookieSettings() {
    if (document.getElementById('archimedes-cookie-settings')) return;
    var button = document.createElement('button');
    button.id = 'archimedes-cookie-settings';
    button.type = 'button';
    button.textContent = 'Nastavení cookies';
    button.setAttribute('aria-label', 'Otevřít nastavení cookies');
    button.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9998;border:1px solid #d1d5db;border-radius:999px;background:#fff;color:#111827;padding:8px 12px;font:600 12px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.15);cursor:pointer';

    var panel = document.createElement('div');
    panel.id = 'archimedes-cookie-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Nastavení cookies');
    panel.style.cssText = 'position:fixed;left:12px;bottom:56px;z-index:10001;width:min(420px,calc(100vw - 24px));background:#111827;color:#fff;border-radius:14px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.35);font:14px/1.45 system-ui';

    function render() {
      var a = read(ANALYTICS_KEY) === 'granted';
      var m = read(MARKETING_KEY) === 'granted';
      panel.innerHTML = '<strong style="display:block;font-size:17px;margin-bottom:8px">Nastavení cookies</strong>' +
        '<p style="margin:0 0 12px;color:#e5e7eb">Nezbytné cookies jsou vždy aktivní. Analytiku a marketing můžete povolit samostatně.</p>' +
        '<label style="display:flex;gap:9px;align-items:flex-start;margin:10px 0"><input id="ac-analytics" type="checkbox" '+(a?'checked':'')+'> <span><b>Analytické</b><br><small style="color:#d1d5db">Pomáhají nám měřit návštěvnost a zlepšovat web.</small></span></label>' +
        '<label style="display:flex;gap:9px;align-items:flex-start;margin:10px 0"><input id="ac-marketing" type="checkbox" '+(m?'checked':'')+'> <span><b>Marketingové</b><br><small style="color:#d1d5db">Umožní reklamní měření, například Meta Pixel, až bude aktivován.</small></span></label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="ac-essential" type="button" style="padding:9px 12px;border:1px solid #9ca3af;border-radius:9px;background:transparent;color:#fff;cursor:pointer">Pouze nezbytné</button><button id="ac-save" type="button" style="padding:9px 12px;border:0;border-radius:9px;background:#f6c344;color:#111827;font-weight:700;cursor:pointer">Uložit volbu</button></div>' +
        '<a href="/ochrana-osobnich-udaju" style="display:inline-block;margin-top:12px;color:#f6c344">Více informací</a>';
      panel.querySelector('#ac-essential').onclick = function(){ updateConsent('denied','denied'); panel.hidden = true; };
      panel.querySelector('#ac-save').onclick = function(){
        updateConsent(panel.querySelector('#ac-analytics').checked ? 'granted' : 'denied', panel.querySelector('#ac-marketing').checked ? 'granted' : 'denied');
        panel.hidden = true;
      };
    }

    button.onclick = function(){ render(); panel.hidden = !panel.hidden; };
    document.body.appendChild(button);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createCookieSettings);
  else createCookieSettings();
})();`,
          }}
        />
      </Head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
