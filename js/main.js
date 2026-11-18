/* =========================================================
   設定：問い合わせフォームの送信先
   Formspree（https://formspree.io 無料）でフォームを作ると
   「https://formspree.io/f/xxxxxxx」という送信先URLがもらえます。
   それを下の "" の中に貼り付けてください。
   ========================================================= */
const FORM_ENDPOINT = "https://formspree.io/f/mvkaklld";

(() => {
  // スマホのメニュー
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("gnav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      nav.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // スクロールでヘッダーに線
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // お知らせ
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (d) => d.replace(/-/g, ".");
  const isNew = (d) => (Date.now() - new Date(d + "T00:00:00").getTime()) / 864e5 < 30;
  const idOf = (n) => "n" + n.date.replace(/-/g, "") ;
  const news = (window.NEWS || []).slice().sort((a, b) => b.date.localeCompare(a.date));

  const top = document.getElementById("news-top");
  if (top) {
    top.innerHTML = news.slice(0, 4).map((n) => `
      <a class="news-card" href="news.html#${idOf(n)}">
        ${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy">` : ""}
        <div class="body">
          <time datetime="${esc(n.date)}">${fmt(n.date)}</time>${isNew(n.date) ? '<span class="new-badge">NEW</span>' : ""}
          <h3>${esc(n.title)}</h3>
        </div>
      </a>`).join("") || "<p>現在お知らせはありません。</p>";
  }

  const list = document.getElementById("news-list");
  if (list) {
    list.innerHTML = news.map((n) => `
      <li class="news-item" id="${idOf(n)}">
        ${n.image ? `<img src="${esc(n.image)}" alt="${esc(n.title)}のお知らせ画像" loading="lazy" data-zoom>` : "<div></div>"}
        <div>
          <time datetime="${esc(n.date)}">${fmt(n.date)}</time>${isNew(n.date) ? '<span class="new-badge">NEW</span>' : ""}
          <h2>${esc(n.title)}</h2>
          <p>${esc(n.body).replace(/\n/g, "<br>")}</p>
        </div>
      </li>`).join("") || "<li>現在お知らせはありません。</li>";
    if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  }

  // 画像の拡大
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = "<img alt=''>";
  document.body.appendChild(lb);
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-zoom]");
    if (img && window.matchMedia("(max-width: 700px)").matches) return; // スマホでは拡大しない
    if (img) { lb.firstChild.src = img.src; lb.firstChild.alt = img.alt; lb.classList.add("open"); }
    else if (e.target.closest(".lightbox")) lb.classList.remove("open");
  });

  // ふわっと表示
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -60px 0px" }) : null;
  document.querySelectorAll(".fade").forEach((el) => io ? io.observe(el) : el.classList.add("in"));

  // Instagram：埋め込みコードが貼られていれば園の写真を隠す。
  // その場所まで画面を動かしてから8秒たっても表示されなければ
  // （サービス停止・上限超えなど）園の写真に戻す。後から表示されたらまた切り替える。
  const insta = document.getElementById("insta-embed");
  const fallback = document.getElementById("insta-fallback");
  if (insta && fallback && insta.children.length) {
    fallback.hidden = true;
    const loaded = () => insta.offsetHeight >= 30;
    const useInsta = () => { insta.hidden = false; fallback.hidden = true; };
    const useFallback = () => { fallback.hidden = false; fallback.classList.add("in"); };
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (loaded()) useInsta(); }).observe(insta);
    const startTimer = () => setTimeout(() => { if (!loaded()) useFallback(); }, 8000);
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { vio.disconnect(); startTimer(); }
      }, { rootMargin: "200px 0px" });
      vio.observe(insta.closest("section") || insta);
    } else startTimer();
  }

  // 問い合わせフォーム
  const form = document.getElementById("contact-form");
  if (form) {
    const msg = document.getElementById("form-msg");
    const btn = form.querySelector("button[type=submit]");
    // 「採用について」「その他」の時は、お子さんの生年月日欄を隠す（送信もしない）
    const childWrap = document.getElementById("f-child-wrap");
    const childInput = document.getElementById("f-child");
    const syncChild = () => {
      const v = (form.querySelector("input[name='種類']:checked") || {}).value;
      const hide = v === "採用について" || v === "その他";
      childWrap.hidden = hide;
      childInput.disabled = hide;
    };
    form.querySelectorAll("input[name='種類']").forEach((r) => r.addEventListener("change", syncChild));
    form.addEventListener("reset", () => setTimeout(syncChild));
    syncChild();
    const show = (cls, html) => { msg.className = "form-msg " + cls; msg.innerHTML = html; msg.scrollIntoView({ block: "center" }); };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.querySelector(".hp input").value) return; // 迷惑メール対策
      if (!FORM_ENDPOINT) {
        show("ng", "※ 現在フォームの送信先が未設定です（js/main.js の FORM_ENDPOINT）。お手数ですがお電話でお問い合わせください。");
        return;
      }
      btn.disabled = true; btn.textContent = "送信中…";
      try {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        show("ok", "<strong>送信が完了しました。</strong><br>お問い合わせありがとうございます。内容を確認のうえ、担当よりご連絡いたします。数日たっても返信がない場合は、お手数ですがお電話でご連絡ください。");
      } catch (err) {
        show("ng", "送信できませんでした。時間をおいて再度お試しいただくか、お電話でお問い合わせください。");
      } finally {
        btn.disabled = false; btn.textContent = "送信する";
      }
    });
  }
})();
