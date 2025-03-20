const API_KEY = '9ec53eb51411bc6aecbfd9bdd0fba4c2';
const DOM_ELEMENTS = {
  wrapper: document.querySelector('.main-wrapper'),
  searchBtn: document.querySelector('.js-search-btn'),
  searchInput: document.querySelector('.js-input'),
  loading: document.querySelector('.loading'),
  temp: document.querySelector('.js-temperature'),
  weatherImg: document.querySelector('.js-weather-img'),
  cityName: document.querySelector('.js-city-name'),
  airCondition: document.querySelector('.js-air-condition'),
  airDescription: document.querySelector('.air-description'),
  feels: document.querySelector('.js-feels'),
  humidity: document.querySelector('.js-percent'),
  windSpeed: document.querySelector('.js-wind-speed'),
  errorMsg: document.querySelector('.error-message'),
  conditionIcon: document.querySelector('.condition-icon > i'),
};

// Utility Functions
function showLoading() {
  DOM_ELEMENTS.loading.style.display = 'block';
}

function hideLoading() {
  DOM_ELEMENTS.loading.style.display = 'none';
}

// API Functions
async function fetchWeatherByCity(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      showError('city not found');
      throw new Error('City not found');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      showError('network');
      console.log(error.message);
    }
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Show Error Message
function showError(error) {
  if (error === 'city not found') {
    DOM_ELEMENTS.errorMsg.style.display = 'block';
    setTimeout(() => {
      DOM_ELEMENTS.errorMsg.style.display = 'none';
    }, 3000);
  } else if (error === 'empty input') {
    DOM_ELEMENTS.searchInput.classList.add('error');
    DOM_ELEMENTS.searchInput.focus();
  } else if (error === 'network') {
    DOM_ELEMENTS.errorMsg.innerText =
      'Network error, please check your connection.';
    DOM_ELEMENTS.errorMsg.style.display = 'block';
    setTimeout(() => {
      DOM_ELEMENTS.errorMsg.innerText =
        'Sorry, we couldn’t find that city. Please check the spelling and try again!';
      DOM_ELEMENTS.errorMsg.style.display = 'none';
    }, 3000);
  }
}

// Hide Error Message
function hideError() {
  DOM_ELEMENTS.searchInput.classList.remove('error');
}

// Icon Class
const iconMap = {
  clear: 'fa-sun',
  clouds: 'fa-cloud',
  rain: 'fa-cloud-rain',
  snow: 'fa-snowflake',
  thunderstorm: 'fa-bolt',
  drizzle: 'fa-cloud-showers-heavy',
  mist: 'fa-smog',
};

// UI Functions
function updateWeatherUI(data) {
  const temp = Math.floor(data.main.temp);
  const feel = Math.floor(data.main.feels_like);
  const windSpeed = Math.floor(data.wind.speed);
  const condition = data.weather[0].main.toLowerCase();
  console.log(condition);
  const newIcon = iconMap[condition] || 'fa-cloud-sun';
  console.log(data.weather[0].main.toLowerCase());

  DOM_ELEMENTS.temp.innerText = `${temp}°C`;
  DOM_ELEMENTS.cityName.innerText = data.name;
  DOM_ELEMENTS.airDescription.innerText = data.weather[0].description;
  DOM_ELEMENTS.airCondition.innerText = data.weather[0].main;
  DOM_ELEMENTS.feels.innerText = `${feel}°C`;
  DOM_ELEMENTS.humidity.innerText = `${data.main.humidity}%`;
  DOM_ELEMENTS.windSpeed.innerText = `${windSpeed} km/h`;
  DOM_ELEMENTS.conditionIcon.className = `fas ${newIcon}`;
  // DOM_ELEMENTS.weatherImg.src = `./images/${data.weather[0].main.toLowerCase()}.png`;
  if (data.weather[0].main.toLowerCase() === 'smoke') {
    DOM_ELEMENTS.weatherImg.src = `./images/clouds.png`;
  } else {
    DOM_ELEMENTS.weatherImg.src = `./images/${data.weather[0].main.toLowerCase()}.png`;
  }
  // document.querySelector(
  //   '.test-img'
  // ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  DOM_ELEMENTS.weatherImg.alt = data.weather[0].description; // Improves accessibility
}

// Event Handlers
async function handleSearch() {
  const city = DOM_ELEMENTS.searchInput.value.trim();
  if (!city) {
    showError('empty input');
    return;
  }

  showLoading();
  try {
    const weatherData = await fetchWeatherByCity(city);
    updateWeatherUI(weatherData);
  } catch (error) {
    // Error is already handled in fetchWeatherByCity via showError
  } finally {
    hideLoading();
    saveToStorage(city);
  }
}

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

// Save last Searched Country
function saveToStorage(city) {
  localStorage.setItem('lastCity', JSON.stringify(city));
}

// Initialization
function init() {
  // Event Listeners for search
  DOM_ELEMENTS.searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSearch();
  });
  DOM_ELEMENTS.searchInput.addEventListener('keydown', handleEnterKey);

  // Set up error handling listeners once
  window.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('js-input') ||
      e.target.classList.contains('js-search-btn')
    ) {
      return;
    }
    if (DOM_ELEMENTS.searchInput.classList.contains('error')) hideError();
  });

  DOM_ELEMENTS.searchInput.addEventListener('input', () => {
    if (DOM_ELEMENTS.searchInput.classList.contains('error')) hideError();
  });

  // Clear input on load
  DOM_ELEMENTS.searchInput.value = '';
  DOM_ELEMENTS.searchInput.value =
    JSON.parse(localStorage.getItem('lastCity')) || '';

  if (DOM_ELEMENTS.searchInput.value) {
    DOM_ELEMENTS.searchBtn.click();
  }
}

// Start the app
init();
