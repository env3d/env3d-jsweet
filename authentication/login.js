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
      alert(errorMessage + " Error!");
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
      alert(errorMessage + " Error!");
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
      alert(errorMessage);
    });
};

const passwordReset = () => {
  var auth = firebase.auth();
  const elements = document.getElementById("resetform").elements;
  const email = elements[0].value;
  console.log(elements);
  auth
    .sendPasswordResetEmail(email)
    .then(function () {
      document.getElementById("resetPasswordInfo").style.display = "block";
      setTimeout(() => {
        document.getElementById("resetPasswordInfo").style.display = "none";
        resetCodeModal.style.display = "none";
      }, 4000);
    })
    .catch(function (error) {
      alert(error);
    });
};

//Handles the password reset code modal

// Get the reset modal
var resetCodeModal = document.getElementById("passwordResetModal");

// Get the <span> element that closes the modal
var span = document.getElementById("closePasswordResetModal");

// When the user clicks the button, open the modal
document.getElementById("resetPassword").onclick = function () {
  resetCodeModal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  resetCodeModal.style.display = "none";
};
