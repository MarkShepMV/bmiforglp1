// === THEME TOGGLE ===
(function () {
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);
  
  function updateIcon() {
    if (!t) return;
    t.innerHTML = d === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
  }
  
  updateIcon();
  
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    updateIcon();
  });
})();

// === STATE ===
let heightUnit = 'imperial'; // 'imperial' or 'metric'
let weightUnit = 'imperial';
let selectedSex = 'male';

// === SEX TOGGLE ===
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    selectedSex = btn.dataset.value;
  });
});

// === UNIT SWITCHING ===
document.getElementById('height-unit-switch').addEventListener('click', () => {
  heightUnit = heightUnit === 'imperial' ? 'metric' : 'imperial';
  document.getElementById('height-imperial').classList.toggle('hidden');
  document.getElementById('height-metric').classList.toggle('hidden');
  updateUnitSwitch('height-unit-switch', heightUnit);
});

document.getElementById('weight-unit-switch').addEventListener('click', () => {
  weightUnit = weightUnit === 'imperial' ? 'metric' : 'imperial';
  document.getElementById('weight-imperial').classList.toggle('hidden');
  document.getElementById('weight-metric').classList.toggle('hidden');
  document.getElementById('goal-imperial').classList.toggle('hidden');
  document.getElementById('goal-metric').classList.toggle('hidden');
  updateUnitSwitch('weight-unit-switch', weightUnit);
});

function updateUnitSwitch(id, unit) {
  const switchEl = document.getElementById(id);
  switchEl.querySelectorAll('span').forEach(span => {
    if (span.dataset.unit === unit) {
      span.classList.add('unit-active');
    } else {
      span.classList.remove('unit-active');
    }
  });
}

// === BMI CALCULATION ===
function getHeightInMeters() {
  if (heightUnit === 'imperial') {
    const ft = parseFloat(document.getElementById('height-ft').value) || 0;
    const inches = parseFloat(document.getElementById('height-in').value) || 0;
    const totalInches = ft * 12 + inches;
    return totalInches * 0.0254;
  } else {
    const cm = parseFloat(document.getElementById('height-cm').value) || 0;
    return cm / 100;
  }
}

function getWeightInKg() {
  if (weightUnit === 'imperial') {
    const lbs = parseFloat(document.getElementById('weight-lbs').value) || 0;
    return lbs * 0.453592;
  } else {
    return parseFloat(document.getElementById('weight-kg').value) || 0;
  }
}

function getGoalWeightInKg() {
  if (weightUnit === 'imperial') {
    const lbs = parseFloat(document.getElementById('goal-lbs').value);
    return lbs ? lbs * 0.453592 : null;
  } else {
    const kg = parseFloat(document.getElementById('goal-kg').value);
    return kg || null;
  }
}

function calculateBMI(weightKg, heightM) {
  if (heightM <= 0) return 0;
  return weightKg / (heightM * heightM);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', class: 'cat-underweight' };
  if (bmi < 25) return { label: 'Normal Weight', class: 'cat-normal' };
  if (bmi < 30) return { label: 'Overweight', class: 'cat-overweight' };
  if (bmi < 35) return { label: 'Obese Class I', class: 'cat-obese1' };
  if (bmi < 40) return { label: 'Obese Class II', class: 'cat-obese2' };
  return { label: 'Obese Class III', class: 'cat-obese3' };
}

function getEligibility(bmi) {
  if (bmi >= 30) {
    return {
      type: 'eligible',
      icon: '✅',
      title: 'You May Be a Candidate for GLP-1',
      text: 'Based on your BMI, you may be a candidate for GLP-1 medication. The FDA has approved GLP-1 medications for adults with a BMI of 30 or higher.'
    };
  }
  if (bmi >= 27) {
    return {
      type: 'maybe',
      icon: '⚠️',
      title: 'You May Qualify With Conditions',
      text: 'You may qualify for GLP-1 treatment if you also have a weight-related health condition such as type 2 diabetes, high blood pressure, or high cholesterol.'
    };
  }
  return {
    type: 'unlikely',
    icon: 'ℹ️',
    title: 'GLP-1 May Not Be Indicated',
    text: 'Based on current FDA guidelines, GLP-1 medications are typically prescribed for individuals with a BMI of 30+, or 27+ with weight-related conditions. Consult your healthcare provider for personalized advice.'
  };
}

// === GAUGE NEEDLE ===
function setGaugeNeedle(bmi) {
  // Map BMI to angle.
  // Needle starts pointing UP (0°).
  // -90° = pointing left (low BMI), +90° = pointing right (high BMI)
  const minBMI = 15;
  const maxBMI = 45;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  // Map: minBMI -> -90°, maxBMI -> +90°
  const angle = -90 + ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 180;
  
  const pointer = document.getElementById('gauge-pointer');
  // Use CSS transform for smooth animation
  pointer.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  pointer.style.transformOrigin = '150px 160px';
  pointer.style.transform = `rotate(${angle}deg)`;
}

// === ANIMATE NUMBER ===
function animateNumber(el, target, duration = 600) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = current.toFixed(1);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// === FORM VALIDATION ===
function validateForm() {
  let valid = true;
  const age = document.getElementById('age');
  const ageVal = parseInt(age.value);
  
  // Clear previous errors
  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
  
  if (!ageVal || ageVal < 18 || ageVal > 120) {
    age.classList.add('error');
    valid = false;
  }
  
  if (heightUnit === 'imperial') {
    const ft = document.getElementById('height-ft');
    const inches = document.getElementById('height-in');
    const ftVal = parseFloat(ft.value);
    if (!ftVal || ftVal < 3 || ftVal > 8) {
      ft.classList.add('error');
      valid = false;
    }
    // inches can be 0, so just check it's a valid number
    const inVal = parseFloat(inches.value);
    if (isNaN(inVal) || inVal < 0 || inVal > 11) {
      inches.classList.add('error');
      valid = false;
    }
  } else {
    const cm = document.getElementById('height-cm');
    const cmVal = parseFloat(cm.value);
    if (!cmVal || cmVal < 100 || cmVal > 250) {
      cm.classList.add('error');
      valid = false;
    }
  }
  
  if (weightUnit === 'imperial') {
    const lbs = document.getElementById('weight-lbs');
    const lbsVal = parseFloat(lbs.value);
    if (!lbsVal || lbsVal < 50 || lbsVal > 1000) {
      lbs.classList.add('error');
      valid = false;
    }
  } else {
    const kg = document.getElementById('weight-kg');
    const kgVal = parseFloat(kg.value);
    if (!kgVal || kgVal < 20 || kgVal > 500) {
      kg.classList.add('error');
      valid = false;
    }
  }
  
  return valid;
}

// === FORM SUBMIT ===
document.getElementById('bmi-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  const heightM = getHeightInMeters();
  const weightKg = getWeightInKg();
  const bmi = calculateBMI(weightKg, heightM);
  const category = getBMICategory(bmi);
  const eligibility = getEligibility(bmi);
  
  // Show results
  const resultsSection = document.getElementById('results-section');
  const emailSection = document.getElementById('email-section');
  resultsSection.classList.remove('hidden');
  emailSection.classList.remove('hidden');
  
  // Animate BMI number
  animateNumber(document.getElementById('bmi-number'), bmi);
  
  // Set category
  const catEl = document.getElementById('bmi-category');
  catEl.textContent = category.label;
  catEl.className = 'bmi-category ' + category.class;
  
  // Set gauge needle
  setGaugeNeedle(bmi);
  
  // Set eligibility
  const eligCard = document.getElementById('eligibility-card');
  eligCard.className = 'eligibility-card ' + eligibility.type;
  document.getElementById('eligibility-icon').textContent = eligibility.icon;
  document.getElementById('eligibility-title').textContent = eligibility.title;
  document.getElementById('eligibility-text').textContent = eligibility.text;
  
  // Goal weight
  const goalKg = getGoalWeightInKg();
  const goalInfo = document.getElementById('goal-info');
  
  if (goalKg && goalKg < weightKg) {
    goalInfo.classList.remove('hidden');
    const weightToLose = weightKg - goalKg;
    const goalBMI = calculateBMI(goalKg, heightM);
    
    if (weightUnit === 'imperial') {
      document.getElementById('weight-to-goal').textContent = (weightToLose / 0.453592).toFixed(1) + ' lbs';
    } else {
      document.getElementById('weight-to-goal').textContent = weightToLose.toFixed(1) + ' kg';
    }
    document.getElementById('goal-bmi').textContent = goalBMI.toFixed(1);
  } else {
    goalInfo.classList.add('hidden');
  }
  
  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
});

// === EMAIL FORM ===
document.getElementById('email-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email-input').value;
  if (!email) return;
  
  // Store in localStorage for later Beehiiv integration
  try {
    const stored = JSON.parse(localStorage.getItem('bmiforglp1_emails') || '[]');
    stored.push({
      email: email,
      timestamp: new Date().toISOString(),
      bmi: document.getElementById('bmi-number').textContent
    });
    localStorage.setItem('bmiforglp1_emails', JSON.stringify(stored));
  } catch (err) {
    // localStorage might not be available
  }
  
  // Show success
  document.getElementById('email-form').classList.add('hidden');
  document.getElementById('email-success').classList.remove('hidden');
});

// === SMOOTH SCROLL FOR NAV LINKS ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
