(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("has-js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // 0. 全画面ローンチイントロ・オープニング制御
  const launchIntro = document.querySelector("[data-launch-intro]");
  let introFinished = false;

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    if (launchIntro) {
      launchIntro.classList.add("is-hidden");
    }
    root.classList.add("is_ready");
  }

  if (launchIntro) {
    if (prefersReducedMotion.matches) {
      finishIntro();
    } else {
      // 1.4秒後に自動でスムーズに解除
      const introTimer = window.setTimeout(finishIntro, 1400);

      // クリックやスクロール、タッチで即座にスキップ可能
      launchIntro.addEventListener("click", () => {
        window.clearTimeout(introTimer);
        finishIntro();
      }, { once: true });

      window.addEventListener("scroll", () => {
        if (!introFinished) {
          window.clearTimeout(introTimer);
          finishIntro();
        }
      }, { passive: true, once: true });

      window.addEventListener("keydown", () => {
        window.clearTimeout(introTimer);
        finishIntro();
      }, { once: true });
    }
  } else {
    root.classList.add("is_ready");
  }

  // 1. スクロール進捗バー & ヘッダースクロール追従 & スマホ追従CTA
  const scrollProgress = document.getElementById("scroll_progress");
  const siteHeader = document.querySelector(".site_header");
  const hero = document.querySelector(".hero");
  const floatCta = document.getElementById("float_cta");
  const contactSection = document.getElementById("contact");

  // 参考LPのScroll Expand Hero（SEH）スクロール全画面拡大エンジン
  const sehRunway = document.querySelector("[data-seh-runway]");
  const sehHero = document.querySelector("[data-seh-hero]");
  const sehPin = document.querySelector("[data-seh-pin]");

  // ヒーロー演出：3Dスマホ展開 & 背景パララックス
  const phoneScene = document.querySelector("[data-phone-reveal]");
  const heroBgBox = document.querySelector("[data-parallax-bg]");

  let ticking = false;

  function updateScrollState() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - windowH;
    
    // プログレスバー更新
    if (scrollProgress && docHeight > 0) {
      const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
      scrollProgress.style.width = (progress * 100).toFixed(1) + "%";
    }

    // ヘッダー背景切り替え
    if (siteHeader) {
      siteHeader.classList.toggle("is_scrolled", scrollY > 40);
    }

    // スマホ用追従ボタン（FVを抜けたら表示、問い合わせフォームに入ったら隠す）
    if (floatCta && hero && contactSection) {
      const heroBottom = hero.offsetTop + hero.offsetHeight * 0.7;
      const contactTop = contactSection.getBoundingClientRect().top;
      const shouldShow = scrollY > heroBottom && contactTop > windowH * 0.7;
      floatCta.classList.toggle("is_shown", shouldShow);
    }

    // ヒーロー背景の奥行きパララックス（スクロールでゆっくり後退）
    if (heroBgBox && hero && !prefersReducedMotion.matches) {
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > 0) {
        const bgOffset = scrollY * 0.32;
        heroBgBox.style.transform = `translate3d(0, ${bgOffset.toFixed(1)}px, 0)`;
      }
    }

    // ヒーロー内3Dスマホのスクロール回転展開（-12deg → 0deg に正面を向く）
    if (phoneScene && hero && !prefersReducedMotion.matches) {
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top <= 0) {
        const heroProgress = Math.min(Math.max(-heroRect.top / (hero.offsetHeight * 0.8), 0), 1);
        const rotateDeg = -12 + (heroProgress * 12); // -12deg から 0deg
        const moveY = heroProgress * 40; // 少し下へ浮遊沈み込み
        const moveX = (1 - heroProgress) * 4; // 少し外側から中央へ
        phoneScene.style.setProperty("--phone-reveal-rotate", `${rotateDeg.toFixed(2)}deg`);
        phoneScene.style.setProperty("--phone-reveal-y", `${moveY.toFixed(1)}px`);
        phoneScene.style.setProperty("--phone-reveal-x", `${moveX.toFixed(1)}%`);
      } else if (heroRect.top > 0) {
        phoneScene.style.setProperty("--phone-reveal-rotate", "-12deg");
        phoneScene.style.setProperty("--phone-reveal-y", "0px");
        phoneScene.style.setProperty("--phone-reveal-x", "0%");
      }
    }

    // 参考LPと同じ：Scroll Expand Hero（SEH）スクロール拡大計算
    if (sehRunway && sehHero && !prefersReducedMotion.matches) {
      const expandDistance = windowH * 1.2;
      const scrolled = Math.max(-sehRunway.getBoundingClientRect().top, 0);
      const val = expandDistance > 0 ? Math.min(scrolled / expandDistance, 1) : 0;
      sehHero.style.setProperty("--val", val.toFixed(4));

      const closeDistance = windowH * 0.5;
      const closeProgress = sehPin && closeDistance > 0
        ? Math.min(Math.max(-sehPin.getBoundingClientRect().top / closeDistance, 0), 1)
        : 0;
      sehHero.style.setProperty("--close", closeProgress.toFixed(4));
    }

    ticking = false;
  }

  function queueScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }

  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);
  updateScrollState();

  // 2. 参考LPと同じ：scroll-expand-line の IntersectionObserver
  const sehLines = document.querySelectorAll(".scroll-expand-line");
  if ("IntersectionObserver" in window && sehLines.length) {
    const sehLineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          sehLineObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    sehLines.forEach((line) => sehLineObserver.observe(line));
  } else {
    sehLines.forEach((line) => line.classList.add("is-in"));
  }

  // 3. ふわっと表示（js_reveal）の段階的スタッガー表示
  const revealTargets = document.querySelectorAll(".js_reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is_visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((target, index) => {
      target.style.transitionDelay = `${(index % 3) * 0.08}s`;
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach((t) => t.classList.add("is_visible"));
  }

  // 3-B. お悩みカードのド迫力スタンプ着地（impact_drop）
  const impactTargets = document.querySelectorAll(".impact_drop");
  if ("IntersectionObserver" in window) {
    const impactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is_visible");
          impactObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    impactTargets.forEach((el, idx) => {
      el.style.setProperty("--anim-delay", `${idx * 0.12}s`);
      impactObserver.observe(el);
    });
  } else {
    impactTargets.forEach((el) => el.classList.add("is_visible"));
  }

  // 3-C. お悩みカードの3D Tilt（マウス追従の立体傾き）
  const tiltCards = document.querySelectorAll("[data-tilt]");
  if (!prefersReducedMotion.matches) {
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    });
  }

  // 4. 数値の滑らかなカウントアップ（CountUp Engine）
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
      obj.textContent = Math.floor(easeProgress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = end.toLocaleString();
      }
    };
    window.requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll(".js_counter");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const endVal = parseInt(target.getAttribute("data-target") || "0", 10);
          animateValue(target, 0, endVal, 1000);
          counterObserver.unobserve(target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  // 5. 残枠プログレスメーターのスムーズ伸長アニメーション
  const meterBar = document.querySelector(".limit_meter__bar");
  const meterContainer = document.querySelector(".limit_meter");
  if (meterBar && meterContainer && "IntersectionObserver" in window) {
    meterBar.style.width = "0%";
    const meterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          meterBar.style.width = "50%";
          meterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    meterObserver.observe(meterContainer);
  }

  // 6. ページ内リンクのスムーズスクロール（固定ヘッダーの高さを自動考慮）
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const targetElem = document.querySelector(href);
      if (targetElem) {
        e.preventDefault();
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 10 : 70;
        const targetPos = targetElem.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: targetPos,
          behavior: "smooth"
        });
      }
    });
  });

  // 7. トースト通知機能
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  // 8. フォーム処理（簡易バリデーション＆送信）
  const form = document.getElementById("trial_form");
  const formResult = document.getElementById("form_result");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        if (formResult) {
          formResult.textContent = "必須項目をすべてご入力ください。";
        }
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        showToast("未入力の必須項目があります");
        return;
      }

      if (formResult) {
        formResult.textContent = "ありがとうございます！5営業日以内に当チームよりご連絡いたします。";
      }
      showToast("お申し込みを受け付けました");
      form.reset();
    });
  }
})();
