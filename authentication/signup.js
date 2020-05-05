const signUpWithFirebase = () => {
  const elements = document.getElementById("signupForm").elements;
  const email = elements[0].value;
  const password = elements[1].value;
  const confirmPassword = elements[2].value;
  if (password !== confirmPassword) {
    alert("Password and Confirm Password are not same");
  } else {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(function (succ) {
        var user = firebase.auth().currentUser;
        console.log(user);
        user
          .sendEmailVerification()
          .then(function () {
            alert("Please check your email for a verification link!");
          })
          .catch(function (error) {
            alert(error);
          });
      })
      .catch(function (error) {
        alert(error + " Error!");
      });
  }
};
