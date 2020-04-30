const loginWithFirebase = () => {
  const elements = document.getElementById("loginForm").elements;
  const email = elements[0].value;
  const password = elements[1].value;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(function (succ) {})
    .catch(function (error) {
      const errorMessage = error.message;
      alert(errorMessage + "Error!");
    });
};

const logOutWithFirebase = () => {
  firebase
    .auth()
    .signOut()
    .then(function () {
      expungeThings();
      localStorage.removeItem("uid");
    })
    .catch(function (error) {
      const errorMessage = error.message;
      alert(errorMessage + "Error!");
    });
};

firebase.auth().onAuthStateChanged(function (user) {
  console.log("...");
  if (user) {
    bringBackThings();
    localStorage.setItem("uid", user.uid);
  }
});

const loginWithGoogle = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      if (user) {
        bringBackThings();
        localStorage.setItem("uid", user.uid);
      }
      // ...
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
};
