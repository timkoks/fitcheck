
// FitCheck Variant A - fully working BMI calculator with validation and history
(function(){
  const form = document.getElementById('bmiForm');
  const unitEl = document.getElementById('unit');
  const weightEl = document.getElementById('weight');
  const heightEl = document.getElementById('height');
  const weightUnitLabel = document.getElementById('weightUnit');
  const heightUnitLabel = document.getElementById('heightUnit');
  const resultEl = document.getElementById('result');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistory');

  const STORAGE_KEY = 'fitcheck.history.v1';
  const MAX_HISTORY = 10;

  function readNumber(input){
    if(!input) return NaN;
    // accept comma or dot as decimal separator
    return Number(String(input).trim().replace(',', '.'));
  }

  function formatNumber(n){
    return Math.round(n*10)/10;
  }

  function getCategory(bmi){
    if(bmi < 18.5) return 'Недостатня вага';
    if(bmi < 25) return 'Норма';
    if(bmi < 30) return 'Надмірна вага';
    return 'Ожиріння';
  }

  function loadHistory(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveHistory(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function renderHistory(){
    const items = loadHistory();
    historyList.innerHTML = '';
    if(items.length === 0){
      historyList.innerHTML = '<li style="opacity:.7">Історія порожня</li>';
      return;
    }
    items.forEach(it=>{
      const li = document.createElement('li');
      li.innerHTML = `<div>
        <div style="font-weight:700">${it.bmi} — ${it.category}</div>
        <div style="font-size:13px;color:#6b7280">${it.unitLabel} · ${it.weight}${it.weightUnit} · ${it.height}${it.heightUnit}</div>
      </div>
      <div style="font-size:12px;color:#94a3b8">${new Date(it.ts).toLocaleString()}</div>`;
      historyList.appendChild(li);
    });
  }

  function pushHistory(entry){
    const items = loadHistory();
    items.unshift(entry);
    if(items.length > MAX_HISTORY) items.length = MAX_HISTORY;
    saveHistory(items);
    renderHistory();
  }

  function setUnitLabels(){
    if(unitEl.value === 'metric'){
      weightUnitLabel.textContent = 'кг';
      heightUnitLabel.textContent = 'см';
      weightEl.placeholder = 'Наприклад: 65';
      heightEl.placeholder = 'Наприклад: 175';
    } else {
      weightUnitLabel.textContent = 'lb';
      heightUnitLabel.textContent = 'in';
      weightEl.placeholder = 'Наприклад: 150';
      heightEl.placeholder = 'Наприклад: 70';
    }
  }

  unitEl.addEventListener('change', setUnitLabels);

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    resultEl.textContent = '';
    const unit = unitEl.value;
    const rawW = readNumber(weightEl.value);
    const rawH = readNumber(heightEl.value);

    // validate
    if(!isFinite(rawW) || rawW <= 0){
      resultEl.textContent = 'Введи коректну вагу (позитивне число).';
      resultEl.style.color = '#b91c1c';
      return;
    }
    if(!isFinite(rawH) || rawH <= 0){
      resultEl.textContent = 'Введи коректний зріст (позитивне число).';
      resultEl.style.color = '#b91c1c';
      return;
    }

    let bmi;
    if(unit === 'metric'){
      const weight = rawW; // kg
      const height_m = rawH / 100; // cm -> m
      bmi = weight / (height_m * height_m);
    } else {
      // imperial: lb and inches
      bmi = (rawW / (rawH * rawH)) * 703;
    }

    if(!isFinite(bmi) || bmi <= 0){
      resultEl.textContent = 'Не вдалося розрахувати ІМТ. Перевір введені дані.';
      resultEl.style.color = '#b91c1c';
      return;
    }

    bmi = formatNumber(bmi);
    const category = getCategory(bmi);

    resultEl.style.color = '';
    resultEl.innerHTML = `<strong>ІМТ: ${bmi}</strong> — ${category}`;

    // push to history
    pushHistory({
      bmi,
      category,
      ts: Date.now(),
      unitLabel: unit === 'metric' ? 'кг/см' : 'lb/in',
      weight: rawW,
      height: rawH,
      weightUnit: unit === 'metric' ? 'кг' : 'lb',
      heightUnit: unit === 'metric' ? 'см' : 'in'
    });
  });

  clearHistoryBtn.addEventListener('click', function(){
    if(confirm('Очистити історію розрахунків?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
    }
  });

  // initialize
  setUnitLabels();
  renderHistory();

})();
