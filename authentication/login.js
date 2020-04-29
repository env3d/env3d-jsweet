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
  if (user) {
    bringBackThings();
    localStorage.setItem("uid", user.uid);
  }
});
