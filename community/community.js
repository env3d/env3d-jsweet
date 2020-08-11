const showSnackBar = () => {
  const snackbar = document.getElementById("snackbar");
  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
};

const hosts = {
  heroku: "https://c3d-backend.herokuapp.com/",
  local: "http://localhost:3000/",
};

const fetchCreations = () => {
  let urlArr = window.location.href.split("/");
  if (
    !localStorage.getItem("uid") ||
    !localStorage.getItem("userEmail") ||
    !localStorage.getItem("userName")
  ) {
    alert("Please Enable Cookies!!");
    window.location.href = urlArr[0] + "//" + urlArr[2];
  }

  creationsLoader.style.display = "block";
  const current = {
    urlLocal: urlArr[0] + "//" + urlArr[2],
    urlProd: "https://java.c3d.io/",
    urlGit: "https://arsh-uppal.github.io/c3d-java-dev-community/",
  };

  fetch(hosts.heroku + "api/creations/all")
    .then((response) => response.json())
    .then((data) => {
      creationsLoader.style.display = "none";
      if (data.length > 0) {
        noDataErr.style.display = "none";
        const cardsConatiner = document.getElementById("cardsContainer");
        data.map((creation) => {
          const cardDiv = document.createElement("div");
          cardDiv.className = "card";

          const iframeDiv = document.createElement("div");
          iframeDiv.className = "iframeContainer";

          const iframe = document.createElement("iframe");
          iframe.src = current.urlGit + "#" + creation.creationCode;
          iframe.title = "Output";
          iframe.className = "iframeOutput";
          iframe.height = "100%";
          iframe.width = "100%";

          iframeDiv.appendChild(iframe);

          const infoDiv = document.createElement("div");
          infoDiv.className = "infoContainer";
          const infoSpan = document.createElement("span");
          infoSpan.innerHTML =
            creation.creationName + " By: " + creation.userName;
          const loadCreation = document.createElement("a");
          loadCreation.className = "loadCreation";
          loadCreation.innerHTML = "load code";
          loadCreation.href = current.urlGit + "#" + creation.creationCode;
          loadCreation.target = "_blank";
          infoDiv.appendChild(infoSpan);
          infoDiv.appendChild(loadCreation);

          cardDiv.appendChild(iframeDiv);
          cardDiv.appendChild(infoDiv);

          cardsConatiner.appendChild(cardDiv);
        });
      } else {
        noDataErr.style.display = "block";
      }
    });
};
