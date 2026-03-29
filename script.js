/* ── CURSOR (pointer:fine only) ─────────────────── */
    if (window.matchMedia('(pointer:fine)').matches) {
      const dot  = document.getElementById('curDot');
      const ring = document.getElementById('curRing');
      if (dot) dot.style.display = 'block';
      if (ring) ring.style.display = 'block';
      let mx=0,my=0,rx=0,ry=0;

      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left  = mx+'px'; dot.style.top  = my+'px';
      });
      (function animRing(){
        rx += (mx-rx)*.12; ry += (my-ry)*.12;
        ring.style.left = rx+'px'; ring.style.top = ry+'px';
        requestAnimationFrame(animRing);
      })();

      document.querySelectorAll('a,button,.pc-item,.svc-card,.faq-item').forEach(el=>{
        el.addEventListener('mouseenter',()=> document.body.classList.add('hovering'));
        el.addEventListener('mouseleave',()=> document.body.classList.remove('hovering'));
      });
    }

    /* ── NAV SCROLL ─────────────────────────────────── */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ── MOBILE MENU ────────────────────────────────── */
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    function closeMenu() {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('hidden', '');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      menuBtn.focus();
    }

    menuBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      if (menuOpen) {
        mobileMenu.removeAttribute('hidden');
        // Force reflow so transition plays after hidden is removed
        mobileMenu.getBoundingClientRect();
      }
      mobileMenu.classList.toggle('open', menuOpen);
      menuBtn.setAttribute('aria-expanded', String(menuOpen));
      const spans = menuBtn.querySelectorAll('span');
      if (menuOpen) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
        // Move focus into menu
        var firstLink = mobileMenu.querySelector('.mm-link');
        if (firstLink) firstLink.focus();
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        mobileMenu.setAttribute('hidden', '');
      }
    });

    document.querySelectorAll('.mm-link').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    /* ── FAQ ACCORDION ──────────────────────────────── */
    document.querySelectorAll('.faq-item').forEach(item => {
      var btn = item.querySelector('.faq-q');
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('open');
          var b = i.querySelector('.faq-q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ── SCROLL REVEAL ──────────────────────────────── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          setTimeout(()=> e.target.classList.add('in'), (Array.from(e.target.parentNode?.children||[]).indexOf(e.target) % 4)*80);
          obs.unobserve(e.target);
        }
      });
    }, {threshold:.1});

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));


    /* ── HERO CAROUSEL ─────────────────────────────────────── */
    (function() {
      const track = document.getElementById('hcTrack');
      const slides = track ? track.querySelectorAll('.hc-slide') : [];
      const dots   = document.querySelectorAll('.hc-dot');
      let current = 0, isAnimating = false;

      function goTo(n) {
        if (isAnimating) return;
        isAnimating = true;
        current = (n + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        setTimeout(() => isAnimating = false, 750);
      }

      const prevBtn = document.getElementById('hcPrev');
      const nextBtn = document.getElementById('hcNext');
      if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
      dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

      // Auto-advance (only one timer at a time)
      let autoTimer = null;
      function startAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4500);
      }
      function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      }
      startAuto();

      const hc = document.getElementById('heroCarousel');
      if (hc) {
        hc.addEventListener('mouseenter', stopAuto);
        hc.addEventListener('mouseleave', startAuto);
      }

      // Pause when page is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAuto(); else startAuto();
      });

      // Touch/swipe
      let touchStartX = 0;
      if (track) {
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
        track.addEventListener('touchend', e => {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
        });
      }

    })();

    /* ── GALLERY IMAGE DATA ──────────────────────────────────── */
    /* Helper: build srcset string and pick default src from optimized variants */
    function optSrcset(base, widths) {
      return widths.map(function(w) { return 'images/opt/' + base + '-' + w + 'w.jpg ' + w + 'w'; }).join(', ');
    }
    function optSrc(base, widths) {
      // Default src: pick 800w if available, else the smallest
      var pick = widths.indexOf(800) !== -1 ? 800 : widths[0];
      return 'images/opt/' + base + '-' + pick + 'w.jpg';
    }
    function optMax(base, widths) {
      return 'images/opt/' + base + '-' + widths[widths.length - 1] + 'w.jpg';
    }

    var galleryData = {
      couples: [
        { opt: 'couples-evelina', widths: [400, 800, 1200], ratio: 0.72 },
        { opt: 'portfolio-golden-hour', widths: [400, 800, 913], ratio: 0.71 },
        { opt: 'portfolio-film-still', widths: [400, 800, 1019], ratio: 0.90 }
      ],
      portraits: [
        { opt: 'grad-coer', widths: [400, 800, 1200, 1920], ratio: 0.79 },
        { opt: 'portfolio-senior-season', widths: [400, 800, 1013], ratio: 0.89 },
        { opt: 'portfolio-desert-dusk', widths: [400, 800, 888], ratio: 0.68 },
        { opt: 'portfolio-golden-hour', widths: [400, 800, 913], ratio: 0.71 }
      ],
      families: [
        { opt: 'family-airplane', widths: [400, 800, 1013], ratio: 0.89 },
        { opt: 'family-portraits-1', widths: [400, 800, 1200, 1920], ratio: 0.80 },
        { opt: 'family-portraits-2', widths: [400, 800, 1200, 1920], ratio: 0.79 },
        { opt: 'family-portraits-7', widths: [400, 800, 1200, 1920], ratio: 2.65 },
        { opt: 'family-portraits-3', widths: [400, 800, 1200, 1920], ratio: 0.76 },
        { opt: 'family-portraits-10', widths: [400, 800, 1200, 1920], ratio: 0.80 },
        { opt: 'family-portraits-11', widths: [400, 800, 1200, 1920], ratio: 2.54 },
        { opt: 'family-portraits-4', widths: [400, 800, 1200, 1920], ratio: 0.72 },
        { opt: 'family-portraits-5', widths: [400, 800, 1200, 1920], ratio: 0.78 },
        { opt: 'family-portraits-15', widths: [400, 800, 1200, 1920], ratio: 1.63 },
        { opt: 'family-portraits-9', widths: [400, 800, 1200, 1920], ratio: 0.76 },
        { opt: 'family-portraits-12', widths: [400, 800, 1200, 1920], ratio: 0.98 },
        { opt: 'family-portraits-8', widths: [400, 800, 1200, 1920], ratio: 2.33 },
        { opt: 'family-portraits-6', widths: [400, 800, 1200, 1920], ratio: 0.76 },
        { opt: 'family-portraits-13', widths: [400, 800, 1200, 1920], ratio: 0.89 },
        { opt: 'family-portraits-18', widths: [400, 800, 1200, 1920], ratio: 2.04 },
        { opt: 'family-portraits-14', widths: [400, 800, 1200, 1920], ratio: 0.89 },
        { opt: 'family-portraits-16', widths: [400, 800, 1200, 1920], ratio: 0.81 },
        { opt: 'family-portraits-19', widths: [400, 800, 1200, 1920], ratio: 1.62 },
        { opt: 'family-portraits-17', widths: [400, 800, 1200, 1903], ratio: 0.90 },
        { opt: 'family-portraits-21', widths: [400, 800, 1200, 1920], ratio: 0.85 },
        { opt: 'family-portraits-20', widths: [400, 800, 1200, 1920], ratio: 1.64 },
        { opt: 'family-portraits-23', widths: [400, 800, 1200, 1920], ratio: 0.85 },
        { opt: 'family-portraits-25', widths: [400, 800, 1200, 1920], ratio: 0.82 },
        { opt: 'family-portraits-22', widths: [400, 800, 1200, 1920], ratio: 2.25 },
        { opt: 'family-portraits-24', widths: [400, 800, 1200, 1920], ratio: 2.11 },
        { opt: 'family-portraits-26', widths: [400, 800, 1200, 1920], ratio: 0.78 },
        { opt: 'family-portraits-27', widths: [400, 800, 1200, 1920], ratio: 0.84 }
      ]
    };

    /* ── PORTFOLIO — CATEGORY CARDS, TABS, GALLERY ────────── */
    (function() {
      var carousel = document.getElementById('portCarousel');
      var wrap = carousel ? carousel.parentElement : null;
      var galleryView = document.getElementById('galleryView');
      var galleryGrid = document.getElementById('galleryGrid');
      var galleryTitle = document.getElementById('galleryTitle');
      var galleryBack = document.getElementById('galleryBack');
      var arrowL = document.getElementById('carArrowL');
      var arrowR = document.getElementById('carArrowR');
      if (!carousel || !wrap) return;

      var categoryLabels = {
        'couples': 'Couples',
        'portraits': 'Portraits & Grads',
        'families': 'Family Portraits'
      };

      // Each HTML item is already a cover card (one per category)
      var coverItems = Array.from(carousel.querySelectorAll('.pc-item'));
      coverItems.forEach(function(cover) {
        var cat = cover.dataset.cat;
        cover.classList.add('category-cover');

        var overlay = document.createElement('div');
        overlay.className = 'pc-category-overlay';
        var count = galleryData[cat] ? galleryData[cat].length : 0;
        overlay.innerHTML =
          '<div class="pc-category-name">' + (categoryLabels[cat] || cat) + '</div>' +
          '<div class="pc-category-count">' + count + ' photo' + (count !== 1 ? 's' : '') + '</div>';
        cover.querySelector('.pc-bg').appendChild(overlay);
      });

      // ── Carousel state ──────────────────────────────────────
      var cOffset = 0;
      var dragging = false, dragStartX = 0, dragStartOffset = 0, dragDistance = 0;
      var touchStartX = 0, touchOffsetStart = 0, touchDist = 0;
      var galleryOpen = false;

      function itemW() {
        var first = carousel.querySelector('.pc-item.category-cover');
        if (!first) return 520;
        return first.getBoundingClientRect().width + 12;
      }

      function getCovers() {
        return Array.from(carousel.querySelectorAll('.pc-item.category-cover:not(.pc-clone)'));
      }

      function buildStrip() {
        carousel.querySelectorAll('.pc-clone').forEach(function(el) { el.remove(); });
        var sources = getCovers();
        if (sources.length === 0) return;

        var preFrag = document.createDocumentFragment();
        sources.slice().reverse().forEach(function(src) {
          var clone = src.cloneNode(true);
          clone.classList.add('pc-clone');
          clone.querySelectorAll('input[type=file]').forEach(function(i) { i.remove(); });
          preFrag.prepend(clone);
        });
        carousel.prepend(preFrag);

        var postFrag = document.createDocumentFragment();
        sources.forEach(function(src) {
          var clone = src.cloneNode(true);
          clone.classList.add('pc-clone');
          clone.querySelectorAll('input[type=file]').forEach(function(i) { i.remove(); });
          postFrag.appendChild(clone);
        });
        carousel.appendChild(postFrag);

        var IW = itemW();
        cOffset = sources.length * IW;
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
        carousel.getBoundingClientRect();
        carousel.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      function checkLoop() {
        var sources = getCovers();
        if (sources.length === 0) return;
        var IW = itemW();
        var setW = sources.length * IW;
        if (cOffset < setW * 0.5) {
          carousel.style.transition = 'none';
          cOffset += setW;
          carousel.style.transform = 'translateX(-' + cOffset + 'px)';
          carousel.getBoundingClientRect();
          carousel.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
        } else if (cOffset >= setW * 2.5) {
          carousel.style.transition = 'none';
          cOffset -= setW;
          carousel.style.transform = 'translateX(-' + cOffset + 'px)';
          carousel.getBoundingClientRect();
          carousel.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }

      // ── Arrows ──────────────────────────────────────────────
      function scrollCarousel(dir) {
        cOffset += dir * itemW();
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
        setTimeout(checkLoop, 580);
      }
      if (arrowL) arrowL.addEventListener('click', function(e) { e.stopPropagation(); scrollCarousel(-1); });
      if (arrowR) arrowR.addEventListener('click', function(e) { e.stopPropagation(); scrollCarousel(1); });

      // ── Mouse drag ──────────────────────────────────────────
      carousel.addEventListener('mousedown', function(e) {
        dragging = true;
        dragStartX = e.clientX;
        dragStartOffset = cOffset;
        dragDistance = 0;
        carousel.style.transition = 'none';
      });
      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        var dx = e.clientX - dragStartX;
        dragDistance = Math.abs(dx);
        cOffset = dragStartOffset - dx * 1.8;
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
      });
      window.addEventListener('mouseup', function(e) {
        if (!dragging) return;
        dragging = false;
        carousel.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
        if (dragDistance < 8) {
          var target = e.target.closest('.pc-item');
          if (target && target.dataset.cat) {
            activateTab(target.dataset.cat);
          }
        }
        // Snap in swipe direction — any movement commits to next card
        var IW = itemW();
        var delta = cOffset - dragStartOffset;
        if (dragDistance >= 8 && delta > 0) {
          cOffset = Math.ceil(cOffset / IW) * IW;
        } else if (dragDistance >= 8 && delta < 0) {
          cOffset = Math.floor(cOffset / IW) * IW;
        } else {
          cOffset = Math.round(cOffset / IW) * IW;
        }
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
        checkLoop();
      });

      // ── Touch ───────────────────────────────────────────────
      carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchOffsetStart = cOffset;
        touchDist = 0;
        carousel.style.transition = 'none';
      }, {passive: true});
      carousel.addEventListener('touchmove', function(e) {
        var dx = e.touches[0].clientX - touchStartX;
        touchDist = Math.abs(dx);
        cOffset = touchOffsetStart - dx * 1.8;
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
      }, {passive: true});
      carousel.addEventListener('touchend', function(e) {
        carousel.style.transition = 'transform .55s cubic-bezier(0.16, 1, 0.3, 1)';
        if (touchDist < 12) {
          var el = document.elementFromPoint(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          );
          var item = el ? el.closest('.pc-item') : null;
          if (item && item.dataset.cat) {
            activateTab(item.dataset.cat);
          }
        }
        // Snap in swipe direction — any movement commits to next card
        var IW = itemW();
        var delta = cOffset - touchOffsetStart;
        if (touchDist >= 12 && delta > 0) {
          cOffset = Math.ceil(cOffset / IW) * IW;
        } else if (touchDist >= 12 && delta < 0) {
          cOffset = Math.floor(cOffset / IW) * IW;
        } else {
          cOffset = Math.round(cOffset / IW) * IW;
        }
        carousel.style.transform = 'translateX(-' + cOffset + 'px)';
        checkLoop();
      });

      // ── Tab handling ────────────────────────────────────────
      function activateTab(cat) {
        // Update active tab
        document.querySelectorAll('.port-tabs .tab').forEach(function(t) {
          t.classList.remove('active');
          if (t.dataset.cat === cat) t.classList.add('active');
        });

        if (cat === 'all') {
          if (galleryOpen) closeGallery();
          return;
        }
        openGallery(cat);
      }

      document.querySelectorAll('.port-tabs .tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          activateTab(tab.dataset.cat);
        });
      });

      // ── Gallery open / close ────────────────────────────────
      var GALLERY_SHOW_LIMIT = 14;

      function openGallery(cat) {
        var imageData = (galleryData[cat] || []).map(function(d) {
          return { opt: d.opt, widths: d.widths, ratio: d.ratio, isLandscape: d.ratio > 1.2 };
        });
        if (cat === 'all') {
          imageData = [];
          Object.keys(galleryData).forEach(function(k) {
            galleryData[k].forEach(function(d) {
              imageData.push({ opt: d.opt, widths: d.widths, ratio: d.ratio, isLandscape: d.ratio > 1.2 });
            });
          });
        }
        var label = categoryLabels[cat] || 'All Photos';

        // Animate carousel out
        wrap.classList.add('hiding');

        setTimeout(function() {
          wrap.style.display = 'none';
          galleryTitle.textContent = label;
          galleryGrid.innerHTML = '';
          galleryGrid.style.maxHeight = '';
          galleryGrid.classList.remove('has-more');
          var existingVm = galleryView.querySelector('.gallery-view-more');
          if (existingVm) existingVm.remove();

          if (imageData.length === 0) return;

          // Build masonry layout: 2-col sections + full-width landscapes
          var portraitBuffer = [];

          function flushPortraits() {
            if (portraitBuffer.length === 0) return;
            var colsDiv = document.createElement('div');
            colsDiv.className = 'gallery-cols';
            var col1 = document.createElement('div');
            col1.className = 'gallery-col';
            var col2 = document.createElement('div');
            col2.className = 'gallery-col';

            var h1 = 0, h2 = 0;
            portraitBuffer.forEach(function(data) {
              var div = document.createElement('div');
              div.className = 'g-item';
              div.style.aspectRatio = String(data.ratio);
              var newImg = document.createElement('img');
              newImg.src = optSrc(data.opt, data.widths);
              newImg.srcset = optSrcset(data.opt, data.widths);
              newImg.sizes = '(max-width: 768px) 46vw, (max-width: 1200px) 40vw, 600px';
              newImg.alt = '';
              newImg.loading = 'lazy';
              div.appendChild(newImg);

              if (h1 <= h2) {
                col1.appendChild(div);
                h1 += 1 / data.ratio;
              } else {
                col2.appendChild(div);
                h2 += 1 / data.ratio;
              }
            });

            colsDiv.appendChild(col1);
            colsDiv.appendChild(col2);
            galleryGrid.appendChild(colsDiv);
            portraitBuffer = [];
          }

          imageData.forEach(function(data) {
            if (data.isLandscape) {
              flushPortraits();
              var div = document.createElement('div');
              div.className = 'g-item g-landscape';
              div.style.aspectRatio = String(data.ratio);
              var newImg = document.createElement('img');
              newImg.src = optSrc(data.opt, data.widths);
              newImg.srcset = optSrcset(data.opt, data.widths);
              newImg.sizes = '(max-width: 768px) 94vw, (max-width: 1200px) 80vw, 1200px';
              newImg.alt = '';
              newImg.loading = 'lazy';
              div.appendChild(newImg);
              galleryGrid.appendChild(div);
            } else {
              portraitBuffer.push(data);
            }
          });
          flushPortraits();

          // Wire up lightbox click + keyboard handlers
          lbSrcs = imageData.map(function(d) { return optMax(d.opt, d.widths); });
          var gItems = galleryGrid.querySelectorAll('.g-item');
          gItems.forEach(function(item, i) {
            item.style.cursor = 'pointer';
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', 'View image ' + (i + 1));
            item.addEventListener('click', function() { openLightbox(i); });
            item.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
            });
          });

          // Show gallery
          galleryView.style.display = 'block';
          galleryView.classList.remove('exit');
          galleryOpen = true;

          // View More: clip with partial peek if many images
          if (imageData.length > GALLERY_SHOW_LIMIT) {
            galleryGrid.classList.add('has-more');
            galleryGrid.getBoundingClientRect(); // force layout

            // Calculate cutoff so a partial image peeks out
            var sections = galleryGrid.children;
            var itemCount = 0;
            var cutHeight = 0;

            for (var si = 0; si < sections.length; si++) {
              var section = sections[si];
              if (section.classList.contains('gallery-cols')) {
                itemCount += section.querySelectorAll('.g-item').length;
              } else if (section.classList.contains('g-item')) {
                itemCount += 1;
              }

              if (itemCount >= GALLERY_SHOW_LIMIT) {
                cutHeight = section.offsetTop + section.offsetHeight;
                if (si + 1 < sections.length) {
                  cutHeight += 8 + sections[si + 1].offsetHeight * 0.35;
                }
                break;
              }
            }

            if (cutHeight > 0) {
              galleryGrid.style.transition = 'none';
              galleryGrid.style.maxHeight = cutHeight + 'px';
              galleryGrid.getBoundingClientRect();
              galleryGrid.style.transition = '';
            }

            // Insert view-more bar
            var viewMoreBar = document.createElement('div');
            viewMoreBar.className = 'gallery-view-more';
            viewMoreBar.innerHTML =
              '<div class="view-more-fade"></div>' +
              '<button class="view-more-btn">' +
              '<span>View More</span>' +
              '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
              '<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>' +
              '</button>';

            viewMoreBar.querySelector('.view-more-btn').addEventListener('click', function() {
              galleryGrid.style.maxHeight = galleryGrid.scrollHeight + 'px';
              galleryGrid.classList.remove('has-more');
              viewMoreBar.classList.add('hidden');
              setTimeout(function() {
                galleryGrid.style.maxHeight = '';
                viewMoreBar.remove();
              }, 600);
            });

            galleryGrid.parentNode.insertBefore(viewMoreBar, galleryGrid.nextSibling);
          }

          requestAnimationFrame(function() {
            galleryView.classList.add('enter');
          });
        }, 420);
      }

      function closeGallery() {
        if (!galleryOpen) return;
        galleryView.classList.remove('enter');
        galleryView.classList.add('exit');

        setTimeout(function() {
          galleryView.style.display = 'none';
          galleryView.classList.remove('exit');
          galleryGrid.style.maxHeight = '';
          galleryGrid.classList.remove('has-more');
          var vmBar = galleryView.querySelector('.gallery-view-more');
          if (vmBar) vmBar.remove();

          wrap.classList.remove('hiding');
          wrap.style.display = '';

          galleryOpen = false;
          buildStrip();
        }, 420);
      }

      if (galleryBack) galleryBack.addEventListener('click', function() {
        // Reset to All tab
        document.querySelectorAll('.port-tabs .tab').forEach(function(t) {
          t.classList.remove('active');
          if (t.dataset.cat === 'all') t.classList.add('active');
        });
        closeGallery();
      });

      // ── Lightbox ─────────────────────────────────────────────
      var lbOverlay = document.createElement('div');
      lbOverlay.className = 'lightbox-overlay';
      lbOverlay.setAttribute('role', 'dialog');
      lbOverlay.setAttribute('aria-modal', 'true');
      lbOverlay.setAttribute('aria-label', 'Image lightbox');
      lbOverlay.innerHTML =
        '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<button class="lightbox-nav lb-prev" aria-label="Previous image">&#8249;</button>' +
        '<button class="lightbox-nav lb-next" aria-label="Next image">&#8250;</button>' +
        '<img src="" alt="">' +
        '<div class="lightbox-counter" aria-live="polite"></div>';
      document.body.appendChild(lbOverlay);

      var lbImg = lbOverlay.querySelector('img');
      var lbCounter = lbOverlay.querySelector('.lightbox-counter');
      var lbSrcs = [];
      var lbIndex = 0;

      var lbReturnFocus = null;

      function openLightbox(index) {
        lbReturnFocus = document.activeElement;
        lbIndex = index;
        lbImg.classList.remove('lb-loaded');
        lbImg.src = lbSrcs[lbIndex];
        lbCounter.textContent = (lbIndex + 1) + ' / ' + lbSrcs.length;
        lbOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Mark background content as inert for assistive tech
        document.querySelectorAll('body > :not(.lightbox-overlay)').forEach(function(el) {
          el.setAttribute('aria-hidden', 'true');
        });
        lbOverlay.querySelector('.lightbox-close').focus();
        lbImg.onload = function() { lbImg.classList.add('lb-loaded'); };
        if (lbImg.complete) lbImg.classList.add('lb-loaded');
      }

      function closeLightbox() {
        lbOverlay.classList.remove('active');
        document.body.style.overflow = '';
        // Restore background content visibility
        document.querySelectorAll('body > [aria-hidden="true"]').forEach(function(el) {
          el.removeAttribute('aria-hidden');
        });
        if (lbReturnFocus) { lbReturnFocus.focus(); lbReturnFocus = null; }
      }

      function lbNav(dir) {
        lbIndex = (lbIndex + dir + lbSrcs.length) % lbSrcs.length;
        lbImg.classList.remove('lb-loaded');
        lbImg.src = lbSrcs[lbIndex];
        lbCounter.textContent = (lbIndex + 1) + ' / ' + lbSrcs.length;
        lbImg.onload = function() { lbImg.classList.add('lb-loaded'); };
        if (lbImg.complete) lbImg.classList.add('lb-loaded');
      }

      lbOverlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lbOverlay.querySelector('.lb-prev').addEventListener('click', function(e) { e.stopPropagation(); lbNav(-1); });
      lbOverlay.querySelector('.lb-next').addEventListener('click', function(e) { e.stopPropagation(); lbNav(1); });
      lbOverlay.addEventListener('click', function(e) {
        if (e.target === lbOverlay) closeLightbox();
      });
      document.addEventListener('keydown', function(e) {
        if (!lbOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lbNav(-1);
        if (e.key === 'ArrowRight') lbNav(1);
        // Focus trap: cycle Tab within lightbox buttons
        if (e.key === 'Tab') {
          var focusable = lbOverlay.querySelectorAll('button');
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      });

      // Touch swipe for lightbox
      var lbTouchX = 0;
      lbOverlay.addEventListener('touchstart', function(e) {
        lbTouchX = e.changedTouches[0].clientX;
      }, { passive: true });
      lbOverlay.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - lbTouchX;
        if (Math.abs(dx) > 50) lbNav(dx < 0 ? 1 : -1);
      });

      // ── "View More" flash on carousel movement & scroll ────
      function flashViewMore() {
        var overlays = carousel.querySelectorAll('.pc-category-overlay');
        overlays.forEach(function(o) { o.classList.add('show-view-more'); });
      }

      // Wrap scrollCarousel so arrows trigger flash (closures reference by name)
      var _origScroll = scrollCarousel;
      scrollCarousel = function(dir) {
        _origScroll(dir);
        flashViewMore();
      };

      // Flash on drag/touch end
      carousel.addEventListener('mouseup', function() { if (dragDistance >= 8) flashViewMore(); });
      carousel.addEventListener('touchend', function() { if (touchDist >= 12) flashViewMore(); });

      // Flash on first scroll into portfolio section
      var scrollFlashed = false;
      var portfolioSection = document.getElementById('portfolio');
      if (portfolioSection) {
        var scrollObs = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting && !scrollFlashed) {
            scrollFlashed = true;
            flashViewMore();
            scrollObs.disconnect();
          }
        }, { threshold: 0.3 });
        scrollObs.observe(portfolioSection);
      }

      // ── Init ────────────────────────────────────────────────
      buildStrip();
      window.addEventListener('resize', function() { if (!galleryOpen) buildStrip(); });
    })();

    /* ── PROCESS FLOWCHART — click to expand ────────────── */
    function updateFlowLine() {
      var flowLine = document.querySelector('.flow-line');
      var circles = document.querySelectorAll('.step-circle');
      var flow = document.querySelector('.process-flow');
      if (!flowLine || circles.length < 2 || !flow) return;
      var flowRect = flow.getBoundingClientRect();
      var firstRect = circles[0].getBoundingClientRect();
      var lastRect = circles[circles.length - 1].getBoundingClientRect();
      var top = firstRect.top + firstRect.height / 2 - flowRect.top;
      var bottom = lastRect.top + lastRect.height / 2 - flowRect.top;
      flowLine.style.top = top + 'px';
      flowLine.style.bottom = 'auto';
      flowLine.style.height = (bottom - top) + 'px';
    }

    function toggleStep(step) {
      var wasActive = step.classList.contains('active');
      document.querySelectorAll('.process-step.active').forEach(function(s) {
        s.classList.remove('active');
        s.setAttribute('aria-expanded', 'false');
      });
      if (!wasActive) {
        step.classList.add('active');
        step.setAttribute('aria-expanded', 'true');
      }
      setTimeout(updateFlowLine, 500);
    }

    document.querySelectorAll('.process-step').forEach(function(step) {
      step.addEventListener('click', function() { toggleStep(step); });
    });

    // Initial line calculation
    updateFlowLine();
    window.addEventListener('resize', updateFlowLine);

    /* ── CONTACT FORM ──────────────────────────────── */
    (function() {
      var form = document.getElementById('contactForm');
      var status = document.getElementById('formStatus');
      if (!form || !status) return;

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous state
        status.textContent = '';
        status.className = 'f-status';
        form.querySelectorAll('.f-error').forEach(function(el) { el.classList.remove('f-error'); });

        // Validate required fields
        var name = form.querySelector('#cf-name');
        var email = form.querySelector('#cf-email');
        var session = form.querySelector('#cf-session');
        var valid = true;

        if (!name.value.trim()) { name.classList.add('f-error'); valid = false; }
        if (!email.value.trim() || !email.validity.valid) { email.classList.add('f-error'); valid = false; }
        if (!session.value) { session.classList.add('f-error'); valid = false; }

        if (!valid) {
          status.textContent = 'Please fill out the required fields.';
          status.className = 'f-status f-fail';
          var firstErr = form.querySelector('.f-error');
          if (firstErr) firstErr.focus();
          return;
        }

        // Submit via fetch
        var submitBtn = form.querySelector('.f-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function(res) {
          if (res.ok) {
            status.textContent = 'Thank you! I\'ll be in touch within 48 hours.';
            status.className = 'f-status f-success';
            form.reset();
          } else {
            throw new Error('Server error');
          }
        }).catch(function() {
          status.textContent = 'Something went wrong. Please email alanscinematics@gmail.com directly.';
          status.className = 'f-status f-fail';
        }).finally(function() {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Inquiry';
        });
      });
    })();
