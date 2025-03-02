document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("ALBUMZY_TOKEN", function (data) {
    const token = data["ALBUMZY_TOKEN"];
    const authDiv = document.getElementById("auth");
    const logoutDiv = document.getElementById("logout-container");

    if (token) {
      authDiv.style.display = "none";
      logoutDiv.style.display = "block";
    }
  });

  document.getElementById("login").addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("https://albumzy.com/api/user/login", {
      method : "POST",
      headers: {"Content-Type": "application/json"},
      body   : JSON.stringify({username, password})
    }).then(response => {
      return response.json();
    }).then(data => {
      if (data.token) {
        chrome.storage.local.set({"ALBUMZY_TOKEN": data.token}, function () {
          document.getElementById("auth").style.display = "none";
          document.getElementById("logout-container").style.display = "block";
        });

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {"message": "onLoginComplete"});
        });
      } else {
        if (data?.error) {
          alert(data.error)
        }
      }
    }).catch((error) => {
      console.error("Error during login:", error)
    });
  });

  document.getElementById("logout").addEventListener("click", function () {
    chrome.storage.local.remove("ALBUMZY_TOKEN", function () {
      document.getElementById("auth").style.display = "block";
      document.getElementById("logout-container").style.display = "none";
      window.location.reload();
    });
  });
});