/* ── CURSOR ─────────────────────────────────────── */
    const dot  = document.getElementById('curDot');
    const ring = document.getElementById('curRing');
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

    document.querySelectorAll('a,button,.port-item,.svc-card,.testi-card,.faq-item').forEach(el=>{
      el.addEventListener('mouseenter',()=> document.body.classList.add('hovering'));
      el.addEventListener('mouseleave',()=> document.body.classList.remove('hovering'));
    });

    /* ── NAV SCROLL ─────────────────────────────────── */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ── MOBILE MENU ────────────────────────────────── */
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    menuBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      const spans = menuBtn.querySelectorAll('span');
      if(menuOpen){
        spans[0].style.transform='translateY(6px) rotate(45deg)';
        spans[1].style.opacity='0';
        spans[2].style.transform='translateY(-6px) rotate(-45deg)';
      } else {
        spans.forEach(s=>{ s.style.transform=''; s.style.opacity=''; });
      }
    });

    document.querySelectorAll('.mm-link').forEach(a => {
      a.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        menuBtn.querySelectorAll('span').forEach(s=>{ s.style.transform=''; s.style.opacity=''; });
      });
    });

    /* ── PORTFOLIO TABS ─────────────────────────────── */
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        document.querySelectorAll('.port-item').forEach(item => {
          const match = cat === 'all' || item.dataset.cat === cat;
          item.style.display = match ? '' : 'none';
        });
      });
    });

    /* ── CARD SPOTLIGHT ─────────────────────────────── */
    document.querySelectorAll('.port-item').forEach(item => {
      item.addEventListener('mousemove', e => {
        const r = item.getBoundingClientRect();
        const x = ((e.clientX-r.left)/r.width)*100;
        const y = ((e.clientY-r.top)/r.height)*100;
        item.querySelector('.port-bg').style.setProperty('--mx', x+'%');
        item.querySelector('.port-bg').style.setProperty('--my', y+'%');
      });
    });

    /* ── FAQ ACCORDION ──────────────────────────────── */
    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-q').addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
        if(!wasOpen) item.classList.add('open');
      });
    });

    /* ── SCROLL REVEAL ──────────────────────────────── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e,i) => {
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

      // Auto-advance
      let autoTimer = setInterval(() => goTo(current + 1), 4500);
      const hc = document.getElementById('heroCarousel');
      if (hc) {
        hc.addEventListener('mouseenter', () => clearInterval(autoTimer));
        hc.addEventListener('mouseleave', () => { autoTimer = setInterval(() => goTo(current + 1), 4500); });
      }

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

    /* ── PORTFOLIO — CATEGORY CARDS, TABS, GALLERY ────────── */
    (function() {
      var carousel = document.getElementById('portCarousel');
      var wrap = carousel ? carousel.parentElement : null;
      var portfolioHead = document.querySelector('.portfolio-head');
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

      // Gather all original items by category
      var allItems = Array.from(carousel.querySelectorAll('.pc-item'));
      var categories = {};
      allItems.forEach(function(item) {
        var cat = item.dataset.cat;
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
      });

      // Mark first item of each category as cover, hide rest
      Object.keys(categories).forEach(function(cat) {
        var cover = categories[cat][0];
        cover.classList.add('category-cover');

        var overlay = document.createElement('div');
        overlay.className = 'pc-category-overlay';
        var count = categories[cat].length;
        overlay.innerHTML =
          '<div class="pc-category-name">' + (categoryLabels[cat] || cat) + '</div>' +
          '<div class="pc-category-count">' + count + ' photo' + (count !== 1 ? 's' : '') + '</div>';
        cover.querySelector('.pc-bg').appendChild(overlay);

        categories[cat].slice(1).forEach(function(item) {
          item.style.display = 'none';
        });
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
        var items = (cat === 'all')
          ? allItems
          : (categories[cat] || []);
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

          // Collect image data with aspect ratios
          var imageData = [];
          items.forEach(function(item) {
            var img = item.querySelector('.pc-img');
            if (!img) return;
            var src = img.getAttribute('src');
            if (!src) return;
            var ratio = parseFloat(item.dataset.ratio);
            if (!ratio || isNaN(ratio)) {
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                ratio = img.naturalWidth / img.naturalHeight;
              } else {
                ratio = 0.8;
              }
            }
            imageData.push({
              src: src,
              ratio: ratio,
              isLandscape: ratio > 1.2
            });
          });

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
              newImg.src = data.src;
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
              newImg.src = data.src;
              newImg.alt = '';
              newImg.loading = 'lazy';
              div.appendChild(newImg);
              galleryGrid.appendChild(div);
            } else {
              portraitBuffer.push(data);
            }
          });
          flushPortraits();

          // Wire up lightbox click handlers
          lbSrcs = imageData.map(function(d) { return d.src; });
          var gItems = galleryGrid.querySelectorAll('.g-item');
          gItems.forEach(function(item, i) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function() { openLightbox(i); });
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
      lbOverlay.innerHTML =
        '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<button class="lightbox-nav lb-prev" aria-label="Previous">&#8249;</button>' +
        '<button class="lightbox-nav lb-next" aria-label="Next">&#8250;</button>' +
        '<img src="" alt="">' +
        '<div class="lightbox-counter"></div>';
      document.body.appendChild(lbOverlay);

      var lbImg = lbOverlay.querySelector('img');
      var lbCounter = lbOverlay.querySelector('.lightbox-counter');
      var lbSrcs = [];
      var lbIndex = 0;

      function openLightbox(index) {
        lbIndex = index;
        lbImg.classList.remove('lb-loaded');
        lbImg.src = lbSrcs[lbIndex];
        lbCounter.textContent = (lbIndex + 1) + ' / ' + lbSrcs.length;
        lbOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        lbImg.onload = function() { lbImg.classList.add('lb-loaded'); };
        if (lbImg.complete) lbImg.classList.add('lb-loaded');
      }

      function closeLightbox() {
        lbOverlay.classList.remove('active');
        document.body.style.overflow = '';
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

    document.querySelectorAll('.process-step').forEach(function(step) {
      step.addEventListener('click', function() {
        var wasActive = step.classList.contains('active');
        document.querySelectorAll('.process-step.active').forEach(function(s) {
          s.classList.remove('active');
        });
        if (!wasActive) step.classList.add('active');
        // Recalculate line after transition
        setTimeout(updateFlowLine, 500);
      });
    });

    // Initial line calculation
    updateFlowLine();
    window.addEventListener('resize', updateFlowLine);
