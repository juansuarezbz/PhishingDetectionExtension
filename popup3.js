let phisihingModel;

const loaded = false;
async function loadModel(){
  try{
    phisihingModel = await tf.loadLayersModel(chrome.runtime.getURL('tfjs_model/model.json'));
    console.log('Model Loaded')
    loaded = true;

  }catch(error){
    console.log('Failed to Load:', error);
    
  }
}
/*tf.setBackend('wasm').then(() => {
  tf.ready().then(() => {
    console.log('WASM backend ready');
    loadModel(); // load the model after backend is set
  });
});
*/

loadModel();

document.addEventListener('DOMContentLoaded', function() {  
  const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeCurrentBtn = document.getElementById('analyzeCurrentBtn');
    const resultSection = document.getElementById('resultSection');
    const inputSection = document.getElementById('inputSection');
    const urlDisplay = document.getElementById('urlDisplay');
    const resultBox = document.getElementById('resultBox');
    const featuresContainer = document.getElementById('featuresContainer');
    const loading = document.getElementById('loading');
    
    
    // Add new button
    resultSection.appendChild(newAnalysisBtn);

    // Analyze manually entered URL
    analyzeBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if(loaded == false  ){
        console.log('Model not loaded, moving on to back up')
        analyzeUrl(url || null);
        
      }else{
        console.log('Model loaded')
      }
    });
    
    // Analyze current tab URL
    analyzeCurrentBtn.addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          if(loaded == false){
            console.log('Model not loaded, moving on to back up')
            urlInput.value = tabs[0].url;
            analyzeUrl(tabs[0].url);
          }else{
            console.log('Model Loaded')
          }

        }
      });
    });

    newAnalysisBtn.addEventListener('click', () => {
      resetForm();
    });
    
    function analyzeUrl(url) {
      
        if (!url) {
          // If no URL provided, use current tab
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
              performAnalysis(tabs[0].url);
            }
          });
        } else {
          performAnalysis(url);
        }
      }
    
    
    function performAnalysis(url) {
      // Show loading, hide input
      inputSection.style.display = 'none';
      loading.style.display = 'block';
      resultSection.style.display = 'none';
      
      // Simulate analysis delay 
      setTimeout(() => {
        const result = checkUrl(url);
        displayResult(url, result);
        
        loading.style.display = 'none';
        resultSection.style.display = 'block';
      }, 800);
    }
    
    function checkUrl(url) {
      // Parse the URL
      let parsedUrl;
      try {
        parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch (e) {
        return { isSafe: false, features: [] };
      }
      
      const features = [];
      let suspiciousCount = 0;
      
      // Feature checks 
      const hasHttps = parsedUrl.protocol === 'https:';
      features.push({
        name: 'HTTPS Used?',
        value: hasHttps,
        description: hasHttps ? 'URL uses HTTPS protocol' : 'URL does not use HTTPS (unsafe)'
      });
      if (!hasHttps) suspiciousCount++;
      
      const isIpAddress = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname);
      features.push({
        name: 'Uses domain name?',
        value: !isIpAddress,
        description: isIpAddress ? 'URL uses IP address (unsafe)' : 'URL uses a proper domain name'
      });
      if (isIpAddress) suspiciousCount++;
      
      const subdomains = parsedUrl.hostname.split('.').length - 2;
      const hasManySubdomains = subdomains > 2;
      features.push({
        name: 'Reasonable number of subdomains?',
        value: !hasManySubdomains,
        description: hasManySubdomains ? 
          `URL has ${subdomains} subdomains (high)` : 
          `URL has ${subdomains <= 0 ? 'no' : 'a reasonable number of'} subdomains`
      });
      if (hasManySubdomains) suspiciousCount++;
      
      const hasAtSymbol = url.includes('@');
      features.push({
        name: '@ in URL?',
        value: !hasAtSymbol,
        description: hasAtSymbol ? 
          'URL contains @ (risky)' : 
          'No @ in URL'
      });
      if (hasAtSymbol) suspiciousCount++;
      
      const isLongUrl = url.length > 75;
      features.push({
        name: 'URL length',
        value: !isLongUrl,
        description: isLongUrl ? 
          `URL is ${url.length} characters (long)` : 
          `URL length (${url.length} chars) is reasonable`
      });
      if (isLongUrl) suspiciousCount++;

      
      const trustedDomains = ['edu', 'com', 'org', 'gov', 'net', 'ee', 'eu'];  // ✅ fixed name

      const tldMatch = parsedUrl.hostname.match(/\.([a-z]{2,})$/i);
      const tld = tldMatch ? tldMatch[1] : '';

      const isTrusted = trustedDomains.includes(tld);
      features.push({
        name: 'Domain Extension trusted?',
        value: isTrusted,
        description: isTrusted ? 
        `TLD ".${tld}" is considered trusted`: 
        `TLD ".${tld}" is not in the trusted list`
      });
      if (!isTrusted) suspiciousCount++;  

      
      const hasSuspiciousChars = /[\?\&\=\<\>\{\}\|\^\~\[\]\%`]/.test(parsedUrl.pathname + parsedUrl.search);
      features.push({
        name: 'Suspicious special characters?',
        value: !hasSuspiciousChars,
        description: hasSuspiciousChars ? 
          'URL contains suspicious special characters (?, &, = , etc' : 
          'No suspicious special characters found'
      });
      if (hasSuspiciousChars) suspiciousCount++;
      
      const shorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 'ow.ly', 't.co', 'is.gd', 'buff.ly', 'adf.ly'];
      const isShortened = shorteners.some(domain => parsedUrl.hostname.includes(domain));
      features.push({
        name: 'URL shortening service?',
        value: !isShortened,
        description: isShortened ? 
          'URL is from a known shortening service' : 
          'URL is not shortend'
      });
      if (isShortened) suspiciousCount++;

      const searchEngine = ['www.google.com', 'search.yahoo.com', 'bing.com', 'duckduckgo'];
      const isSearchEngine = searchEngine.some(domain => parsedUrl.hostname.includes(domain));
      features.push({
        name: 'Is search Engine?',
        value: isSearchEngine,
        description: isSearchEngine ? 
          'URL is from a known search engine' : 
          'URL is not a search enching'
      });
      if (isSearchEngine) suspiciousCount--;
      
      // Determine if URL is safe based on features
      const isSafe = suspiciousCount <= 1; // Allow 1 suspicious feature
      
      return {
        isSafe,
        features,
        suspiciousCount,
        totalFeatures: features.length
      };
    }
    
    function displayResult(url, result) {
      urlDisplay.textContent = `URL: ${url}`;
      
      if (result.isSafe) {
        resultBox.textContent = 'This website appears to be SAFE';
        resultBox.className = 'result-box safe';
      } else {
        resultBox.textContent = 'WARNING: This website appears to be UNSAFE';
        resultBox.className = 'result-box unsafe';
      }
      
      // Display features
      featuresContainer.innerHTML = '';
      result.features.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        
        const icon = document.createElement('span');
        icon.className = `feature-icon ${feature.value ? 'check-icon' : 'warning-icon'}`;
        icon.textContent = feature.value ? 'Safe' : 'Risk';
        
        const text = document.createElement('span');
        text.textContent = `${feature.name}: ${feature.description}`;
        
        featureItem.appendChild(icon);
        featureItem.appendChild(text);
        featuresContainer.appendChild(featureItem);
      });
      
      // Add summary
      const summary = document.createElement('p');
      summary.innerHTML = `<strong>Summary:</strong> Found ${result.suspiciousCount} suspicious features out of ${result.totalFeatures} checked. Model not loaded.`;
      featuresContainer.appendChild(summary);
    }
    
    
    function resetForm() {
      urlInput.value = '';
      resultSection.style.display = 'none';
      inputSection.style.display = 'flex';
      newAnalysisBtn.style.display = 'none';
      urlInput.focus(); // Focus the input for new entry
    }

  });