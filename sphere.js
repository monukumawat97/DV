// Digital Vistara - Main Application Logic (Vanilla JS)

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // 1. LIGHT/DARK THEME TOGGLE
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('theme-toggle-sun');
  const moonIcon = document.getElementById('theme-toggle-moon');

  // Set theme on load
  const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for futuristic premium feel
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  // Toggle theme click event
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  });

  // ==========================================
  // 2. MOBILE MENU TOGGLE
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // ==========================================
  // 3. 3D HOVER TILT CARDS
  // ==========================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  const maxTilt = 10; // Degrees

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // ==========================================
  // 4. SCROLL REVEAL (INTERSECTION OBSERVER)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 5. ABOUT SECTION - CONNECTED 3D NODES
  // ==========================================
  const nodes = document.querySelectorAll('.node-item');
  const nodeTexts = {
    'node-idea': { title: '1. Core Idea', desc: 'Understanding your business vision, auditing requirements, and planning the conceptual roadmap.' },
    'node-launch': { title: '2. Launch Phase', desc: 'Design, development, and system deployments. Launching clean, ultra-responsive digital structures.' },
    'node-growth': { title: '3. Growth & Traffic', desc: 'SEO, performance marketing, content design, and running campaigns to drive targeted traffic.' },
    'node-scale': { title: '4. Scaling Stage', desc: 'Analytics integration, custom APIs, conversion optimization, and multiplying revenues at scale.' }
  };

  const infoTitle = document.getElementById('node-info-title');
  const infoDesc = document.getElementById('node-info-desc');
  let activeNodeIndex = 0;
  let nodeInterval;

  function setNodeActive(nodeId) {
    // Deactivate all nodes
    nodes.forEach(n => {
      n.classList.remove('active', 'scale-110', 'bg-softPurple', 'text-white', 'shadow-[0_0_20px_#B9A7FF]');
      n.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-800', 'dark:text-slate-200');
    });

    // Activate selected
    const activeNode = document.getElementById(nodeId);
    if (activeNode) {
      activeNode.classList.add('active', 'scale-110', 'bg-softPurple', 'text-white', 'shadow-[0_0_20px_#B9A7FF]');
      activeNode.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-800', 'dark:text-slate-200');
      
      // Update text
      if (infoTitle && infoDesc && nodeTexts[nodeId]) {
        infoTitle.style.opacity = 0;
        infoDesc.style.opacity = 0;
        
        setTimeout(() => {
          infoTitle.textContent = nodeTexts[nodeId].title;
          infoDesc.textContent = nodeTexts[nodeId].desc;
          infoTitle.style.opacity = 1;
          infoDesc.style.opacity = 1;
        }, 200);
      }
    }
  }

  // Automatic cycle
  function startNodeCycle() {
    nodeInterval = setInterval(() => {
      activeNodeIndex = (activeNodeIndex + 1) % nodes.length;
      const nextNodeId = nodes[activeNodeIndex].id;
      setNodeActive(nextNodeId);
    }, 4500);
  }

  // Click handler to select nodes manually
  nodes.forEach((node, index) => {
    node.addEventListener('click', () => {
      clearInterval(nodeInterval);
      activeNodeIndex = index;
      setNodeActive(node.id);
      startNodeCycle(); // restart auto cycle
    });
  });

  // Init Cycle
  if (nodes.length > 0) {
    setNodeActive(nodes[0].id);
    startNodeCycle();
  }

  // ==========================================
  // 6. PROCESS TIMELINE PROGRESS TRACKER
  // ==========================================
  const timelineSection = document.getElementById('timeline-section');
  const timelineProgress = document.getElementById('timeline-progress-line');

  if (timelineSection && timelineProgress) {
    window.addEventListener('scroll', () => {
      const sectionRect = timelineSection.getBoundingClientRect();
      const sectionHeight = timelineSection.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate how far the timeline is through the viewport
      const startTrigger = sectionRect.top - viewportHeight / 2;
      const totalScrollable = sectionHeight;
      
      let progress = 0;
      if (startTrigger < 0) {
        progress = Math.min(Math.abs(startTrigger) / totalScrollable, 1);
      }
      
      // Update vertical progress line height
      timelineProgress.style.height = `${progress * 100}%`;
    });
  }

  // ==========================================
  // 7. CONTACT FORM SUBMISSION ANIMATION
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Show sending state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Sending...
      `;

      // Simulate API submit delay
      setTimeout(() => {
        // Reset form
        contactForm.reset();
        
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Show success status toast/alert
        if (formStatus) {
          formStatus.textContent = "Message sent successfully! Our experts will connect shortly.";
          formStatus.classList.remove('hidden', 'text-red-400');
          formStatus.classList.add('text-green-400', 'animate-pulse');
          
          setTimeout(() => {
            formStatus.classList.add('hidden');
          }, 6000);
        }
      }, 2000);
    });
  }

  // ==========================================
  // 8. SCROLLSPY (ACTIVE LINK HIGHLIGHTER)
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('header nav div.hidden a');
  const mobileNavLinks = document.querySelectorAll('#mobile-menu a');

  function updateActiveNavLink() {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120; // offset for fixed header

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Desktop highlighting
    desktopNavLinks.forEach(link => {
      link.classList.remove('text-softPurple', 'font-semibold');
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('text-softPurple', 'font-semibold');
      }
    });

    // Mobile highlighting
    mobileNavLinks.forEach(link => {
      // Don't highlight the CTA button inside the mobile menu
      if (link.classList.contains('glow-border-btn')) return;
      link.classList.remove('text-softPurple', 'font-semibold');
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('text-softPurple', 'font-semibold');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);
  updateActiveNavLink(); // Initial call
});
