document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const focusToggle = document.getElementById('focusToggle');
  const startTimerButton = document.getElementById('startTimer');
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const timerDisplay = document.getElementById('timerDisplay');
  const statusElement = document.getElementById('status');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordBox = document.getElementById('passwordBox');
  const passwordInput = document.getElementById('passwordInput');
  const passwordDisplay = document.getElementById('passwordDisplay');
  const submitPasswordButton = document.getElementById('submitPassword');
  const cancelPasswordButton = document.getElementById('cancelPassword');
  const blocklistInput = document.getElementById('blocklistInput');
  const addToBlocklistButton = document.getElementById('addToBlocklist');
  const blocklistItemsContainer = document.getElementById('blocklistItems');
  const presetButtons = document.querySelectorAll('.preset-button');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Variables
  let currentPassword = '';
  let passwordRequired = false;
  let attemptingToDisable = false;
  
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding content
      const tabName = tab.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
  
  // Timer presets
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const minutes = button.getAttribute('data-minutes');
      const hours = button.getAttribute('data-hours');
      
      if (minutes) {
        hoursInput.value = 0;
        minutesInput.value = minutes;
      } else if (hours) {
        hoursInput.value = hours;
        minutesInput.value = 0;
      }
    });
  });
  
  // Load current state
  chrome.storage.local.get([
    'focusMode', 
    'timerEnd', 
    'allowedTabs', 
    'passwordProtection', 
    'blocklist'
  ], (result) => {
    // Focus mode state
    if (result.focusMode) {
      focusToggle.checked = true;
      statusElement.textContent = 'Focus mode is active. New tabs are blocked.';
      
      // If timer is running, show it
      if (result.timerEnd) {
        const now = new Date().getTime();
        const timeLeft = result.timerEnd - now;
        
        if (timeLeft > 0) {
          timerDisplay.style.display = 'block';
          updateTimerDisplay(timeLeft);
          startTimerInterval();
        }
      }
    }
    
    // Password protection
    if (result.passwordProtection) {
      passwordToggle.checked = true;
      passwordRequired = true;
    }
    
    // Blocklist
    if (result.blocklist && result.blocklist.length > 0) {
      renderBlocklist(result.blocklist);
    }
  });
  
  // Handle password toggle
  passwordToggle.addEventListener('change', () => {
    passwordRequired = passwordToggle.checked;
    chrome.storage.local.set({ passwordProtection: passwordRequired });
  });
  
  // Handle focus toggle click
  focusToggle.addEventListener('change', () => {
    if (focusToggle.checked) {
      enableFocusMode();
    } else {
      // Check if password is required
      if (passwordRequired) {
        attemptingToDisable = true;
        // Generate random password
        currentPassword = generateRandomPassword(12);
        passwordDisplay.textContent = currentPassword;
        passwordBox.style.display = 'flex';
        passwordInput.value = '';
        passwordInput.focus();
        
        // Reset toggle to on state since we haven't validated the password yet
        focusToggle.checked = true;
      } else {
        disableFocusMode();
      }
    }
  });
  
  // Handle password submission
  submitPasswordButton.addEventListener('click', () => {
    if (passwordInput.value === currentPassword) {
      passwordBox.style.display = 'none';
      if (attemptingToDisable) {
        attemptingToDisable = false;
        disableFocusMode();
        focusToggle.checked = false;
      }
    } else {
      alert('Incorrect password! Please try again.');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
  
  // Handle password cancel
  cancelPasswordButton.addEventListener('click', () => {
    passwordBox.style.display = 'none';
    attemptingToDisable = false;
  });
  
  // Handle password input keyup
  passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      submitPasswordButton.click();
    }
  });
  
  // Handle blocklist additions
  addToBlocklistButton.addEventListener('click', () => {
    addToBlocklist();
  });
  
  blocklistInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addToBlocklist();
    }
  });
  
  // Handle start timer click
  startTimerButton.addEventListener('click', () => {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const totalMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    
    if (totalMilliseconds <= 0) {
      alert('Please set a valid time duration.');
      return;
    }
    
    // Enable focus mode if not already enabled
    if (!focusToggle.checked) {
      focusToggle.checked = true;
      enableFocusMode();
    }
    
    // Set timer
    startTimer(totalMilliseconds);
  });
  
  function enableFocusMode() {
    // Get current tabs to allow
    chrome.tabs.query({}, (tabs) => {
      const allowedTabs = tabs.map(tab => tab.id);
      
      // Save state
      chrome.storage.local.set({
        focusMode: true,
        allowedTabs: allowedTabs
      }, () => {
        statusElement.textContent = 'Focus mode is active. New tabs are blocked.';
      });
    });
  }
  
  function disableFocusMode() {
    // Clear timer if it exists
    chrome.alarms.clear('focusModeTimer');
    
    // Update storage
    chrome.storage.local.set({
      focusMode: false,
      allowedTabs: [],
      timerEnd: null
    }, () => {
      statusElement.textContent = 'Focus mode is disabled.';
      timerDisplay.style.display = 'none';
    });
  }
  
  function startTimer(duration) {
    const now = new Date().getTime();
    const endTime = now + duration;
    
    // Save end time
    chrome.storage.local.set({ timerEnd: endTime }, () => {
      timerDisplay.style.display = 'block';
      updateTimerDisplay(duration);
      startTimerInterval();
    });
    
    // Set alarm for when time is up
    chrome.alarms.create('focusModeTimer', {
      delayInMinutes: duration / 60000 // Convert ms to minutes
    });
  }
  
  let timerInterval;
  function startTimerInterval() {
    // Clear any existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      chrome.storage.local.get(['timerEnd'], (result) => {
        if (!result.timerEnd) {
          clearInterval(timerInterval);
          timerDisplay.style.display = 'none';
          return;
        }
        
        const now = new Date().getTime();
        const timeLeft = result.timerEnd - now;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          timerDisplay.style.display = 'none';
          return;
        }
        
        updateTimerDisplay(timeLeft);
      });
    }, 1000);
  }
  
  function updateTimerDisplay(timeInMs) {
    const hours = Math.floor(timeInMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
    
    timerDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }
  
  function generateRandomPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  function addToBlocklist() {
    const url = blocklistInput.value.trim();
    if (!url) return;
    
    // Simple URL validation
    if (!isValidUrl(url)) {
      alert('Please enter a valid website URL (e.g., facebook.com, twitter.com)');
      return;
    }
    
    // Format URL (remove protocol if present)
    const formattedUrl = formatUrl(url);
    
    // Get current blocklist
    chrome.storage.local.get(['blocklist'], (result) => {
      const blocklist = result.blocklist || [];
      
      // Check if URL already exists
      if (blocklist.includes(formattedUrl)) {
        alert('This website is already in your blocklist.');
        return;
      }
      
      // Add to blocklist
      blocklist.push(formattedUrl);
      
      // Save updated blocklist
      chrome.storage.local.set({ blocklist }, () => {
        blocklistInput.value = '';
        renderBlocklist(blocklist);
      });
    });
  }
  
  function removeFromBlocklist(url) {
    chrome.storage.local.get(['blocklist'], (result) => {
      const blocklist = result.blocklist || [];
      const updatedBlocklist = blocklist.filter(item => item !== url);
      
      chrome.storage.local.set({ blocklist: updatedBlocklist }, () => {
        renderBlocklist(updatedBlocklist);
      });
    });
  }
  
  function renderBlocklist(blocklist) {
    blocklistItemsContainer.innerHTML = '';
    
    if (blocklist.length === 0) {
      blocklistItemsContainer.innerHTML = '<div class="empty-message">No websites in blocklist.</div>';
      return;
    }
    
    blocklist.forEach(url => {
      const itemElement = document.createElement('div');
      itemElement.className = 'blocklist-item';
      
      const urlElement = document.createElement('div');
      urlElement.textContent = url;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeFromBlocklist(url));
      
      itemElement.appendChild(urlElement);
      itemElement.appendChild(removeButton);
      
      blocklistItemsContainer.appendChild(itemElement);
    });
  }
  
  function isValidUrl(url) {
    // Simple validation - just check if it has at least one dot
    return /[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}/i.test(url);
  }
  
  function formatUrl(url) {
    // Remove protocol if present
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }
  
  function padZero(num) {
    return num.toString().padStart(2, '0');
  }
}); 