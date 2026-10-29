/**
 * Shahreen Qasim Portfolio - Single-Screen 3D Flipbook Controller
 * CIT331 Web Technologies - Single-Screen Non-Scrolling Presentation
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. FLIPBOOK PAGE NAVIGATION CONTROLLER
  // ==========================================================================
  let currentPage = 1;
  const totalPages = 6;
  let isAnimating = false;

  const pages = document.querySelectorAll('.book-page');
  const navBtns = document.querySelectorAll('.nav-btn');
  const pageDots = document.querySelectorAll('.page-dot');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageIndicatorText = document.getElementById('pageIndicatorText');
  const currentSectionName = document.getElementById('currentSectionName');
  const screenReaderAnnouncer = document.getElementById('srAnnouncer');

  const sectionNames = ['Home', 'About Me', 'Education', 'Skills', 'Featured Projects', 'Contact & Connect'];

  const resetAllFlippedCards = () => {
    document.querySelectorAll('.flip-card.is-flipped').forEach(card => {
      card.classList.remove('is-flipped');
      card.setAttribute('aria-expanded', 'false');
    });
  };

  const updatePageClasses = (targetPage) => {
    pages.forEach((page, index) => {
      const pageNum = index + 1;
      page.classList.remove('page-active', 'page-past', 'page-future');
      
      if (pageNum === targetPage) {
        page.classList.add('page-active');
        page.removeAttribute('inert');
        page.setAttribute('aria-hidden', 'false');
      } else if (pageNum < targetPage) {
        page.classList.add('page-past');
        page.setAttribute('inert', '');
        page.setAttribute('aria-hidden', 'true');
      } else {
        page.classList.add('page-future');
        page.setAttribute('inert', '');
        page.setAttribute('aria-hidden', 'true');
      }
    });
  };

  const updateControlsUI = (targetPage) => {
    // Update Prev / Next Buttons
    if (prevBtn) {
      prevBtn.disabled = targetPage === 1;
      prevBtn.classList.toggle('opacity-30', targetPage === 1);
      prevBtn.classList.toggle('pointer-events-none', targetPage === 1);
    }
    if (nextBtn) {
      nextBtn.disabled = targetPage === totalPages;
      nextBtn.classList.toggle('opacity-30', targetPage === totalPages);
      nextBtn.classList.toggle('pointer-events-none', targetPage === totalPages);
    }

    // Update Counter Text
    if (pageIndicatorText) {
      pageIndicatorText.textContent = `Page ${targetPage} / ${totalPages}`;
    }
    if (currentSectionName) {
      currentSectionName.textContent = sectionNames[targetPage - 1];
    }

    // Update Page Dots
    pageDots.forEach((dot, index) => {
      const pageNum = index + 1;
      dot.classList.toggle('active', pageNum === targetPage);
      dot.setAttribute('aria-current', pageNum === targetPage ? 'step' : 'false');
    });

    // Update Top Navigation Bar Links
    navBtns.forEach(btn => {
      const pageNum = parseInt(btn.getAttribute('data-page'), 10);
      btn.classList.toggle('active', pageNum === targetPage);
    });

    // Assistive Technology Announcement
    if (screenReaderAnnouncer) {
      screenReaderAnnouncer.textContent = `Flipped to ${sectionNames[targetPage - 1]}, page ${targetPage} of ${totalPages}`;
    }
  };

  const goToPage = (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage || isAnimating) {
      return;
    }

    isAnimating = true;
    resetAllFlippedCards();

    currentPage = targetPage;
    updatePageClasses(currentPage);
    updateControlsUI(currentPage);

    // Give focus to the active page container for keyboard accessibility
    const activePage = document.querySelector(`.book-page[data-page="${currentPage}"]`);
    if (activePage) {
      activePage.focus();
    }

    setTimeout(() => {
      isAnimating = false;
    }, 600);
  };

  // Expose globally for inline buttons (e.g. Hero CTA "View Projects" -> page 5)
  window.goToPage = goToPage;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  }

  // Top Nav Menu clicks
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = parseInt(btn.getAttribute('data-page'), 10);
      goToPage(targetPage);

      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });

  // Page Dots click
  pageDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetPage = parseInt(dot.getAttribute('data-page'), 10);
      goToPage(targetPage);
    });
  });

  // Initial State Setup
  updatePageClasses(1);
  updateControlsUI(1);

  // ==========================================================================
  // 2. KEYBOARD NAVIGATION & SHORTCUTS
  // ==========================================================================
  document.addEventListener('keydown', (e) => {
    // If user is typing in form input/textarea, do not capture arrow keys
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      goToPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToPage(currentPage - 1);
    } else if (e.key === 'Escape') {
      // Check if a card is flipped; if so, unflip it!
      const flippedCard = document.querySelector('.flip-card.is-flipped');
      if (flippedCard) {
        flippedCard.classList.remove('is-flipped');
        flippedCard.setAttribute('aria-expanded', 'false');
      }
      // Also close CV Modal if open
      const cvModal = document.getElementById('cvModal');
      if (cvModal && !cvModal.classList.contains('hidden')) {
        window.closeCVModal();
      }
    }
  });

  // ==========================================================================
  // 3. TOUCH SWIPE GESTURE SUPPORT (MOBILE & TABLET)
  // ==========================================================================
  let touchStartX = 0;
  let touchStartY = 0;
  const swipeThreshold = 45;

  const stage = document.querySelector('.flipbook-stage');
  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Ensure horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
          // Swipe Left -> Next Page
          goToPage(currentPage + 1);
        } else {
          // Swipe Right -> Prev Page
          goToPage(currentPage - 1);
        }
      }
    }, { passive: true });
  }

  // ==========================================================================
  // 4. INDIVIDUAL 3D FLIP CARDS (FOR PROJECTS & SKILLS)
  // ==========================================================================
  const flipCards = document.querySelectorAll('.flip-card');

  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking directly on a link or button inside the card back, don't toggle flip
      if (e.target.closest('a') && !e.target.closest('.unflip-btn')) {
        return;
      }

      const isAlreadyFlipped = card.classList.contains('is-flipped');

      // Strict rule: Only one card is flipped at a time
      flipCards.forEach(c => {
        if (c !== card) {
          c.classList.remove('is-flipped');
          c.setAttribute('aria-expanded', 'false');
        }
      });

      if (isAlreadyFlipped) {
        card.classList.remove('is-flipped');
        card.setAttribute('aria-expanded', 'false');
      } else {
        card.classList.add('is-flipped');
        card.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard Accessibility for Cards
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.tagName !== 'A') {
          e.preventDefault();
          card.click();
        }
      }
    });
  });

  // Dedicated "Flip Back" buttons inside cards
  document.querySelectorAll('.unflip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentCard = btn.closest('.flip-card');
      if (parentCard) {
        parentCard.classList.remove('is-flipped');
        parentCard.setAttribute('aria-expanded', 'false');
        parentCard.focus();
      }
    });
  });

  // ==========================================================================
  // 5. MOBILE MENU TOGGLE
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', !isHidden);
    });
  }

  // ==========================================================================
  // 6. DARK / LIGHT THEME TOGGLE
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  const themeIconSun = document.getElementById('themeIconSun');
  const themeIconMoon = document.getElementById('themeIconMoon');

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      if (themeIconSun) themeIconSun.classList.remove('hidden');
      if (themeIconMoon) themeIconMoon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      if (themeIconSun) themeIconSun.classList.add('hidden');
      if (themeIconMoon) themeIconMoon.classList.remove('hidden');
    }
  };

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(!isDark);
    });
  }

  // ==========================================================================
  // 7. INTERACTIVE COPY TO CLIPBOARD (EMAIL & PHONE)
  // ==========================================================================
  window.copyToClipboard = (text, elementId) => {
    navigator.clipboard.writeText(text).then(() => {
      const badge = document.getElementById(elementId);
      if (badge) {
        const originalText = badge.innerText;
        badge.innerText = 'Copied! ✓';
        badge.classList.remove('hidden');

        setTimeout(() => {
          badge.innerText = originalText;
        }, 2200);
      }
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // ==========================================================================
  // 8. CONTACT FORM SIMULATION
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('formSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Sending Message...
        `;
      }

      setTimeout(() => {
        if (formSuccess) {
          formSuccess.classList.remove('hidden');
        }
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Message Sent Successfully!</span>
            <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path></svg>
          `;

          setTimeout(() => {
            submitBtn.innerHTML = `
              <span>Send Message</span>
              <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"></path></svg>
            `;
          }, 3500);
        }
      }, 700);
    });
  }

  // ==========================================================================
  // 9. CV MODAL CONTROLS
  // ==========================================================================
  const cvModal = document.getElementById('cvModal');
  window.openCVModal = () => {
    if (cvModal) {
      cvModal.classList.remove('hidden');
    }
  };

  window.closeCVModal = () => {
    if (cvModal) {
      cvModal.classList.add('hidden');
    }
  };

  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) {
        window.closeCVModal();
      }
    });
  }
});
