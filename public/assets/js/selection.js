function filter(x) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
  
    // Add active class to the clicked tab
    const clickedTab = document.querySelector(`.nav-link[onclick="filter('${x}')"]`);
    clickedTab.classList.add('active');
    clickedTab.setAttribute('aria-selected', 'true');
  
    if (x === 'ml') {
      document.getElementById('ml').style.display = "block";
      document.getElementById('fullstack').style.display = "none";
      document.getElementById('dsa').style.display = "none";
    } else if (x === 'fullstack') {
      document.getElementById('ml').style.display = "none";
      document.getElementById('fullstack').style.display = "block";
      document.getElementById('dsa').style.display = "none";
    } else if (x === 'dsa') {
      document.getElementById('ml').style.display = "none";
      document.getElementById('fullstack').style.display = "none";
      document.getElementById('dsa').style.display = "block";
    } 
    //else if (x === 'combo') {
    //   document.getElementById('ml').style.display = "none";
    //   document.getElementById('cloud').style.display = "none";
    //   document.getElementById('dsa').style.display = "none";
    // } 
    else {
      document.getElementById('ml').style.display = "block";
      document.getElementById('fullstack').style.display = "block";
      document.getElementById('dsa').style.display = "block";
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      var currentPage = window.location.pathname.split('/').pop();
      if (!currentPage) {
        currentPage = 'index.html';
      }

      var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
      navLinks.forEach(function (link) {
        var linkTarget = link.getAttribute('href');
        if (!linkTarget) {
          return;
        }

        var normalizedTarget = linkTarget.split('/').pop();
        if (normalizedTarget === currentPage) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    } catch (error) {
      // no-op
    }
  });

  function filter_training(x) {
    // Remove active class from all tabs
    // const tabs = document.querySelectorAll('.nav-link');
    // tabs.forEach(tab => {
    //   tab.classList.remove('active');
    //   tab.setAttribute('aria-selected', 'false');
    // });
  
    if (x === 'ml') {
      document.getElementById('ml').style.display = "block";
      document.getElementById('cloud').style.display = "none";
      document.getElementById('dsa').style.display = "none";
    } else if (x === 'cloud') {
      document.getElementById('ml').style.display = "none";
      document.getElementById('cloud').style.display = "block";
      document.getElementById('dsa').style.display = "none";
    } else if (x === 'dsa') {
      document.getElementById('ml').style.display = "none";
      document.getElementById('cloud').style.display = "none";
      document.getElementById('dsa').style.display = "block";
    } 
    //else if (x === 'combo') {
    //   document.getElementById('ml').style.display = "none";
    //   document.getElementById('cloud').style.display = "none";
    //   document.getElementById('dsa').style.display = "none";
    // } 
    else {
      document.getElementById('ml').style.display = "block";
      document.getElementById('cloud').style.display = "block";
      document.getElementById('dsa').style.display = "block";
    }
  }