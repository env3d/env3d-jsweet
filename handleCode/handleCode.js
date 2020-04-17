'use strict';

// Get the download modal
var downloadModal = document.getElementById("downloadModal");

// Get the <span> element that closes the modal
var span = document.getElementById("closeDownloadModal");

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	downloadModal.style.display = "none";
}

let openDownloadModal = () => {
	downloadModal.style.display = "block";
}

let downloadCode = () => {
	var element = document.createElement('a');

	element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
		encodeURIComponent(localStorage.getItem('code')));
	let fileName = document.getElementById('downloadFileName').value;
	if(fileName.length<1)
		fileName="c3dJava";
	element.setAttribute('download', fileName);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

	setTimeout(function () {
		downloadModal.style.display = "none";
	}, 1000);
}

// Get the upload modal
var modal = document.getElementById("uploadModal");

// Get the button that opens the modal
var btn = document.getElementById("loadCode");

// Get the <span> element that closes the modal
var span = document.getElementById("closeModal");

// When the user clicks the button, open the modal 
btn.onclick = function () {
	modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

//Reading the file 
document.querySelector("#file-input").addEventListener('change', function () {
	// files that user has chosen
	var all_files = this.files;
	if (all_files.length == 0) {
		alert('Error : No file selected');
		return;
	}

	// first file selected by user
	var file = all_files[0];

	// files types allowed
	var allowed_types = ['text/plain'];
	if (allowed_types.indexOf(file.type) == -1) {
		alert('Error : Incorrect file type');
		return;
	}

	// Max 2 MB allowed
	var max_size_allowed = 2 * 1024 * 1024
	if (file.size > max_size_allowed) {
		alert('Error : Exceeded size 2MB');
		return;
	}

	// file validation is successfull
	// we will now read the file

	var reader = new FileReader();

	// file reading started
	reader.addEventListener('loadstart', function () {
		document.querySelector("#file-input-label").style.display = 'none';
	});

	// file reading finished successfully
	reader.addEventListener('load', function (e) {
		var text = e.target.result;

		// contents of the file
		localStorage.setItem('code', text);
		document.querySelector("#file-input-label").style.display = 'block';
		document.querySelector("#uploadMsg").innerHTML = 'Succefully loaded code';
		setTimeout(function () {
			modal.style.display = "none";
			location.reload();
			return false;
		}, 2000);

	});

	// file reading failed
	reader.addEventListener('error', function () {
		alert('Error : Failed to read file ');
		document.querySelector("#uploadMsg").innerHTML = 'Failed, try again!';
	});

	// file read progress 
	reader.addEventListener('progress', function (e) {
		if (e.lengthComputable == true) {
			document.querySelector("#file-progress-percent").innerHTML = Math.floor((e.loaded / e.total) * 100);
			document.querySelector("#file-progress-percent").style.display = 'block';
		}
	});

	// read as text file
	reader.readAsText(file);
});


//Handles the reset code

// Get the reset modal
var resetModal = document.getElementById("resetModal");

// Get the <span> element that closes the modal
var span = document.getElementById("closeResetModal");

// When the user clicks the button, open the modal 
document.getElementById("reset").onclick = function () {
	resetModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	resetModal.style.display = "none";
}

const resetToDefault = () => {
	localStorage.clear();
	window.location.reload();
}