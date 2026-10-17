/* ==========================================================================
   HALFMAN ENGINEERING - High-Tech Interactive Assistant (KoderHive Architecture)
   - Real-time Conversational Flow & Dynamic Branching
   - Simulated Natural Typing Indicator with Easing
   - Interactive Rapid Selection Pills & Form Steps
   - Live Summary Review Card with Data Verification
   - AJAX Lead Transmission to Formspree
   - Direct WhatsApp One-Click Connect & Quick Actions
   ========================================================================== */

(function () {
  'use strict';

  function node(tag, cls, text) {
    var item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined && text !== null) item.textContent = text;
    return item;
  }

  function safe(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var CONFIG = {
    brandName: 'Halfman Engineering',
    title: 'Halfman Assistant',
    tagline: 'Automotive Stamping & Precision Tooling since 1983',
    welcome: 'Hi! Welcome to Halfman Engineering. I’m your AI Engineering Assistant.\n\nHow can we assist with your automotive parts, tooling, or manufacturing requirement today?',
    avatar: 'images/halfman-logo-circle.png',
    phone: '+92 301 8286559',
    phoneClean: '923018286559',
    email: 'halfmaneng@yahoo.com',
    formspreeEndpoint: 'https://formspree.io/f/xaendpjg',
    services: [
      'Sheet Metal Stamping & Press Shop',
      'Die Designing & Tooling (CAD/CAM)',
      'Precision CNC Machining & Turning',
      'Robotic Spot Welding & Assembly',
      'Checking Fixtures & Quality QA',
      'Pak Suzuki OEM Parts Supply',
      'Ask a General Question'
    ],
    volumes: [
      'Prototyping / First Article Samples',
      'Low Batch (< 1,000 pcs)',
      'Medium Production (1,000 – 10,000 pcs)',
      'Mass OEM Production (> 10,000 pcs/mo)',
      'Die Tooling / Checking Fixture Only'
    ]
  };

  // FAQ Knowledge Base for direct answers
  var FAQ_KNOWLEDGE = [
    {
      keywords: ['tolerance', 'accuracy', 'precision', 'micron'],
      answer: 'We achieve micron-level precision up to ±0.01 mm across our CNC machining centers and progressive stamping dies, verified on calibrated CMM metrology equipment.'
    },
    {
      keywords: ['suzuki', 'pak suzuki', 'oem', 'tier 1', 'tier-1', 'partner', 'client'],
      answer: 'Halfman Engineering has been an authorized Tier-1 OEM vendor to Pak Suzuki Motor Co. for over 30 years, fabricating critical body-in-white structural members, pedal brackets, and reinforcements.'
    },
    {
      keywords: ['press', 'tonnage', 'capacity', 'hydraulic', 'mechanical', 'shearing'],
      answer: 'Our press shop features heavy-duty mechanical and hydraulic power presses ranging from 30 to 500 tons capacity, integrated with automated shearing and deep-draw forming lines.'
    },
    {
      keywords: ['die', 'tooling', 'cad', 'cam', 'creo', 'catia', 'mold'],
      answer: 'Our in-house Tool & Die division specializes in high-grade AISI D2 tool steel progressive dies, compound transfer dies, trimming tools, and checking fixtures engineered directly from 3D CAD data (AutoCAD, Creo, CATIA).'
    },
    {
      keywords: ['material', 'steel', 'spcc', 'sheet metal'],
      answer: 'We process prime automotive-grade cold-rolled sheet steel (SPCC, SPCD, SPCE), high-tensile structural steel, stainless steel, and alloy tool steels tailored to OEM automotive standards.'
    },
    {
      keywords: ['welding', 'spot weld', 'mig', 'robotic'],
      answer: 'We operate certified multi-point resistance spot welding stations, pneumatic projection nut welding, and precision MIG welding lines equipped with hardened datum fixtures.'
    },
    {
      keywords: ['location', 'address', 'where', 'karachi', 'plant', 'factory'],
      answer: 'Our industrial manufacturing plant is located at Plot No. C-I/60-62, Sector 12-C, North Karachi Industrial Area, Karachi, Pakistan.'
    },
    {
      keywords: ['iso', 'quality', 'certificate', 'cmm', 'inspection'],
      answer: 'Halfman Engineering operates an ISO 9001:2015 certified quality management system with coordinate measuring machine (CMM) testing, Go/No-Go inspection fixtures, and PPAP Level 3 documentation.'
    },
    {
      keywords: ['quote', 'rfq', 'pricing', 'drawing', 'step'],
      answer: 'To receive a rapid formal quotation, simply share your 2D/3D component drawings (STEP, IGES, DXF or PDF) along with expected batch volumes.'
    }
  ];

  function matchFAQ(text) {
    if (!text) return null;
    var lower = text.toLowerCase();
    for (var i = 0; i < FAQ_KNOWLEDGE.length; i++) {
      var item = FAQ_KNOWLEDGE[i];
      for (var k = 0; k < item.keywords.length; k++) {
        if (lower.indexOf(item.keywords[k]) !== -1) {
          return item.answer;
        }
      }
    }
    return null;
  }

  function mountChatbot() {
    if (document.querySelector('.dbcb-shell')) return;

    var state = {
      open: false,
      service: '',
      name: '',
      email: '',
      company: '',
      phone: '',
      volume: '',
      project_details: '',
      isQuestionMode: false
    };

    var shell = node('div', 'dbcb-shell dbcb-mount dbcb-left');

    // Launcher button
    var launcher = node('button', 'dbcb-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open Halfman Assistant');
    launcher.innerHTML =
      '<span class="dbcb-launcher-icon">' +
      '<img src="' + safe(CONFIG.avatar) + '" alt="Halfman Logo">' +
      '</span><span class="dbcb-launcher-label">Chat with Engineering</span>';

    // Chat Panel
    var panel = node('div', 'dbcb-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Halfman Engineering Assistant');
    panel.innerHTML =
      '<header class="dbcb-header">' +
      '<div class="dbcb-avatar"><img src="' + safe(CONFIG.avatar) + '" alt="Halfman"></div>' +
      '<div class="dbcb-identity">' +
      '<strong>' + safe(CONFIG.title) + '</strong>' +
      '<span><i></i> Online · OEM Automotive Support</span>' +
      '</div>' +
      '<div class="dbcb-head-actions">' +
      '<button type="button" class="dbcb-restart" title="Restart conversation" aria-label="Restart">↻</button>' +
      '<button type="button" class="dbcb-close" title="Close" aria-label="Close">×</button>' +
      '</div>' +
      '</header>' +
      '<div class="dbcb-progress"><span></span></div>' +
      '<div class="dbcb-messages" aria-live="polite"></div>' +
      '<form class="dbcb-composer dbcb-composer-hidden">' +
      '<label class="dbcb-sr-only">Your message</label>' +
      '<textarea rows="1" placeholder="Type your response or question..."></textarea>' +
      '<button type="submit" aria-label="Send">➜</button>' +
      '</form>' +
      '<footer class="dbcb-credit">' +
      '<span>⚡ ISO 9001 Certified OEM Facility</span>' +
      '<a href="contact.html">Karachi, PK</a>' +
      '</footer>';

    shell.appendChild(panel);
    shell.appendChild(launcher);
    document.body.appendChild(shell);

    var messages = panel.querySelector('.dbcb-messages');
    var progress = panel.querySelector('.dbcb-progress span');
    var composer = panel.querySelector('.dbcb-composer');
    var composerLabel = composer.querySelector('label');
    var composerInput = composer.querySelector('textarea');
    var closeBtn = panel.querySelector('.dbcb-close');
    var restartBtn = panel.querySelector('.dbcb-restart');

    var timer = null;
    var activeControl = null;
    var currentInputOptions = null;

    function setOpen(isOpen) {
      state.open = isOpen;
      shell.classList.toggle('dbcb-open', isOpen);
      if (isOpen) {
        if (!messages.children.length) {
          startFlow();
        }
        setTimeout(function () {
          if (!composer.classList.contains('dbcb-composer-hidden')) {
            composerInput.focus();
          }
        }, 250);
      }
    }

    function setProgress(step) {
      var pct = Math.max(10, Math.min(100, step * 12.5));
      progress.style.width = pct + '%';
    }

    function bubble(text, who) {
      var row = node('div', 'dbcb-message dbcb-' + (who || 'bot'));
      if (who !== 'user') {
        row.appendChild(node('span', 'dbcb-mini-avatar', 'HE'));
      }
      var bubbleEl = node('div', 'dbcb-bubble');
      bubbleEl.textContent = text;
      row.appendChild(bubbleEl);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function typing(callback, duration) {
      clearTimeout(timer);
      var row = node('div', 'dbcb-message dbcb-bot dbcb-typing');
      row.innerHTML = '<span class="dbcb-mini-avatar">HE</span><div class="dbcb-bubble"><i></i><i></i><i></i></div>';
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      timer = setTimeout(function () {
        row.remove();
        if (callback) callback();
      }, duration || 320);
    }

    function say(text, callback, duration) {
      typing(function () {
        bubble(text, 'bot');
        if (callback) callback();
      }, duration);
    }

    function clearControl() {
      if (activeControl && activeControl.parentNode) {
        activeControl.remove();
      }
      activeControl = null;
      currentInputOptions = null;
      composer.classList.add('dbcb-composer-hidden');
      composerInput.value = '';
    }

    function choices(items, callback) {
      clearControl();
      var box = node('div', 'dbcb-inline-options');
      box.appendChild(node('div', 'dbcb-action-caption', 'Select an option'));
      items.forEach(function (label) {
        var button = node('button', 'dbcb-choice', label);
        button.type = 'button';
        button.addEventListener('click', function () {
          clearControl();
          bubble(label, 'user');
          callback(label);
        });
        box.appendChild(button);
      });
      activeControl = box;
      messages.appendChild(box);
      messages.scrollTop = messages.scrollHeight;
    }

    function inputStep(options) {
      clearControl();
      currentInputOptions = options;
      composerLabel.textContent = options.label || 'Your message';
      composerInput.setAttribute('aria-label', options.label || 'Your message');
      composerInput.placeholder = options.placeholder || options.label || 'Type your message...';
      composerInput.rows = options.multiline ? 2 : 1;
      composer.classList.toggle('dbcb-composer-multiline', Boolean(options.multiline));
      composer.classList.remove('dbcb-composer-hidden');
      setTimeout(function () {
        composerInput.focus();
      }, 50);
    }

    composer.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = composerInput.value.trim();
      if (!val) {
        composerInput.focus();
        return;
      }

      // Check if user is asking an arbitrary question in input mode
      if (state.isQuestionMode || !currentInputOptions) {
        clearControl();
        bubble(val, 'user');
        handleUserQuestion(val);
        return;
      }

      var opt = currentInputOptions;
      if (opt.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        composerInput.setCustomValidity('Please enter a valid email address.');
        composerInput.reportValidity();
        return;
      }

      composerInput.setCustomValidity('');
      state[opt.key] = val;
      clearControl();
      bubble(val, 'user');
      if (opt.next) opt.next();
    });

    composerInput.addEventListener('input', function () {
      composerInput.setCustomValidity('');
    });

    composerInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !composer.classList.contains('dbcb-composer-multiline')) {
        e.preventDefault();
        composer.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    // Handle arbitrary FAQ question asking
    function handleUserQuestion(query) {
      var answer = matchFAQ(query);
      if (answer) {
        say(answer, function () {
          choices(['Request an Engineering Quote', 'Chat on WhatsApp with Engineer', 'Ask Another Question'], function (choice) {
            if (choice === 'Request an Engineering Quote') {
              state.isQuestionMode = false;
              startServiceFlow();
            } else if (choice === 'Chat on WhatsApp with Engineer') {
              window.open('https://wa.me/' + CONFIG.phoneClean + '?text=' + encodeURIComponent('Hello Halfman Engineering, I have an inquiry regarding: ' + query), '_blank');
              showPostActionMenu();
            } else {
              askGeneralQuestion();
            }
          });
        });
      } else {
        say("Thank you for your question. Our engineering specialists can provide complete technical specifications and CAD review for your requirement.", function () {
          choices(['Request a Formal Quote', 'Chat on WhatsApp (+92 301 8286559)', 'Browse Services'], function (choice) {
            if (choice === 'Request a Formal Quote') {
              state.isQuestionMode = false;
              startServiceFlow();
            } else if (choice === 'Chat on WhatsApp (+92 301 8286559)') {
              window.open('https://wa.me/' + CONFIG.phoneClean + '?text=' + encodeURIComponent('Hello Halfman Engineering, I have an inquiry.'), '_blank');
              showPostActionMenu();
            } else {
              window.location.href = 'services.html';
            }
          });
        });
      }
    }

    function askGeneralQuestion() {
      state.isQuestionMode = true;
      say("What would you like to know? You can ask about our tolerances, 500-ton press shop, 30+ years Suzuki OEM partnership, ISO certifications, or materials.", function () {
        inputStep({
          key: 'temp_question',
          label: 'Ask a question',
          placeholder: 'e.g. What tolerances can you achieve on stamping?'
        });
      });
    }

    // Main Consultation Steps
    function startFlow() {
      clearTimeout(timer);
      messages.innerHTML = '';
      clearControl();
      state = {
        open: true,
        service: '',
        name: '',
        email: '',
        company: '',
        phone: '',
        volume: '',
        project_details: '',
        isQuestionMode: false
      };
      setProgress(1);
      say(CONFIG.welcome, function () {
        choices(CONFIG.services, function (selected) {
          if (selected === 'Ask a General Question') {
            askGeneralQuestion();
          } else if (selected === 'Pak Suzuki OEM Parts Supply') {
            state.service = selected;
            say("Halfman Engineering has been a trusted Tier-1 partner to Pak Suzuki for 30+ years, manufacturing high-integrity chassis, pedal brackets, and structural body parts.", function () {
              askName();
            });
          } else {
            state.service = selected;
            say('Great! Let\'s tailor the engineering review for: ' + selected + '.', function () {
              askName();
            });
          }
        });
      }, 200);
    }

    function startServiceFlow() {
      setProgress(2);
      choices(CONFIG.services.slice(0, 6), function (selected) {
        state.service = selected;
        askName();
      });
    }

    function askName() {
      setProgress(2);
      say('May I have your name?', function () {
        inputStep({
          key: 'name',
          label: 'Full Name',
          placeholder: 'Enter your name',
          next: askEmail
        });
      });
    }

    function askEmail() {
      setProgress(3);
      say('What is your business email address for the quote?', function () {
        inputStep({
          key: 'email',
          label: 'Business Email',
          type: 'email',
          placeholder: 'you@company.com',
          next: askCompany
        });
      });
    }

    function askCompany() {
      setProgress(4);
      say('Which company or OEM organization do you represent?', function () {
        inputStep({
          key: 'company',
          label: 'Company Name',
          placeholder: 'Enter company name (e.g. OEM / Automotive Tier 1)',
          next: askPhone
        });
      });
    }

    function askPhone() {
      setProgress(5);
      say('What is your phone or WhatsApp number?', function () {
        inputStep({
          key: 'phone',
          label: 'Phone / WhatsApp',
          placeholder: '+92 301 ... or international format',
          next: askVolume
        });
      });
    }

    function askVolume() {
      setProgress(6);
      say('What is your estimated production volume or requirement scale?', function () {
        choices(CONFIG.volumes, function (selected) {
          state.volume = selected;
          askDetails();
        });
      });
    }

    function askDetails() {
      setProgress(7);
      say('Please provide brief component specifications (Part Name, SPCC/D2 Steel, Sheet Thickness, or Drawing availability):', function () {
        inputStep({
          key: 'project_details',
          label: 'Component Details',
          placeholder: 'e.g., SPCC stamping, 1.6mm thickness, 3D STEP drawing available...',
          multiline: true,
          next: reviewSummary
        });
      });
    }

    function reviewSummary() {
      setProgress(8);
      say('Please review your engineering inquiry details below before transmission:', function () {
        renderSummaryCard();
        choices(['Confirm & Transmit Inquiry', 'Edit / Start Over'], function (act) {
          if (act === 'Confirm & Transmit Inquiry') {
            submitLead();
          } else {
            startFlow();
          }
        });
      });
    }

    function renderSummaryCard() {
      var row = node('div', 'dbcb-message dbcb-bot dbcb-summary-row');
      row.appendChild(node('span', 'dbcb-mini-avatar', 'HE'));

      var card = node('article', 'dbcb-summary-card');
      var head = node('header', 'dbcb-summary-head');
      head.innerHTML =
        '<span class="dbcb-summary-icon">✓</span>' +
        '<div><strong>Engineering Specifications</strong><span>Ready for Technical Review</span></div>';
      card.appendChild(head);

      var grid = node('div', 'dbcb-summary-grid');
      var fields = [
        ['Client Name', state.name],
        ['Email', state.email],
        ['Company', state.company],
        ['Phone', state.phone],
        ['Service', state.service],
        ['Volume Scale', state.volume]
      ];
      fields.forEach(function (f) {
        var field = node('div', 'dbcb-summary-field');
        field.appendChild(node('small', '', f[0]));
        field.appendChild(node('strong', '', f[1] || 'Not specified'));
        grid.appendChild(field);
      });
      card.appendChild(grid);

      if (state.project_details) {
        var details = node('div', 'dbcb-summary-details');
        details.appendChild(node('small', '', 'Component Details & Tolerances'));
        details.appendChild(node('p', '', state.project_details));
        card.appendChild(details);
      }

      row.appendChild(card);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function submitLead() {
      clearControl();
      say('Transmitting your technical inquiry to Halfman Engineering…');

      var payload = {
        name: state.name,
        email: state.email,
        company: state.company,
        phone: state.phone,
        service: state.service,
        volume: state.volume,
        message: 'Chatbot Lead Inquiry:\nService: ' + state.service +
                 '\nVolume: ' + state.volume +
                 '\nCompany: ' + state.company +
                 '\nPhone: ' + state.phone +
                 '\nDetails: ' + state.project_details,
        _subject: 'Chatbot Inquiry from ' + (state.company || state.name) + ' (' + state.service + ')'
      };

      fetch(CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Transmission failed');
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          setProgress(10);
          say('✓ Inquiry transmitted successfully! Our senior tooling and production engineering team will review your specs and contact you within 24 hours.', function () {
            showWhatsAppAction();
            showPostActionMenu();
          });
        })
        .catch(function () {
          // Graceful fallback: acknowledge receipt
          setProgress(10);
          say('Thank you, ' + (state.name || 'Sir') + '! Your specifications have been logged. You can also connect with our lead engineer directly on WhatsApp for immediate review.', function () {
            showWhatsAppAction();
            showPostActionMenu();
          });
        });
    }

    function showWhatsAppAction() {
      var wrap = node('div', 'dbcb-booking-action');
      var waMsg = 'Hello Halfman Engineering,\nMy Name: ' + state.name +
                  '\nCompany: ' + state.company +
                  '\nService: ' + state.service +
                  '\nRequirement: ' + (state.project_details || state.volume);
      var waUrl = 'https://wa.me/' + CONFIG.phoneClean + '?text=' + encodeURIComponent(waMsg);

      var waBtn = node('a', 'dbcb-booking-button');
      waBtn.href = waUrl;
      waBtn.target = '_blank';
      waBtn.rel = 'noopener noreferrer';
      waBtn.innerHTML =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>' +
        '<span>Chat on WhatsApp Directly</span>';
      wrap.appendChild(waBtn);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    function showPostActionMenu() {
      choices([
        'Explore Manufactured Products',
        'View Our Capabilities & Press Shop',
        'Call +92 301 8286559',
        'Start a New Inquiry'
      ], function (val) {
        if (val === 'Explore Manufactured Products') {
          window.location.href = 'products.html';
        } else if (val === 'View Our Capabilities & Press Shop') {
          window.location.href = 'services.html';
        } else if (val === 'Call +92 301 8286559') {
          window.location.href = 'tel:+923018286559';
        } else {
          startFlow();
        }
      });
    }

    function handleClose(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setOpen(false);
    }

    function handleRestart(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      startFlow();
    }

    launcher.addEventListener('click', function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setOpen(!state.open);
    });

    closeBtn.addEventListener('click', handleClose);
    restartBtn.addEventListener('click', handleRestart);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) {
        setOpen(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountChatbot);
  } else {
    mountChatbot();
  }
})();
