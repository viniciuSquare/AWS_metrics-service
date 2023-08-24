// ELEMENTS SELECTORS
const form = document.getElementById('submit-form');
const buttons = document.getElementById('buttons');
const queueList = document.getElementById('queue-list');

const fileSelectorDiv = document.getElementById('file-selector');
const fileSelectorInput = document.getElementById('file-selector-input');


// 
const formData = new FormData();
let files;

let command = null;

// * LISTENERS
  // * DRAG AND DROP ON DIV
fileSelectorDiv.addEventListener('click', () => fileSelectorInput.click());

fileSelectorDiv.addEventListener('dragover', (event) => {
  event.preventDefault();
  fileSelectorDiv.classList.add('dragover');
});

fileSelectorDiv.addEventListener('dragleave', () => {
  fileSelectorDiv.classList.remove('dragover');
});

fileSelectorDiv.addEventListener('drop', (event) => {
  event.preventDefault();
  fileSelectorDiv.classList.remove('dragover');
  console.log("Files dropped!", event.dataTransfer.files);

  files = event.dataTransfer.files;

  fileSelectorInput.files = files;
  handleFormFilesSelection(files);
});

form.addEventListener('change', (event) => {
  files = event.target.files;
  console.log("Changed!", files);

  handleFormFilesSelection(event.target.files);
});

// * METHODS
function handleFormFilesSelection(files) {
  console.log(files, "handle files selection");
  console.log(fileSelectorInput.files);
  
  Object.values(fileSelectorInput.files).forEach(file=>{
    formData.append('file',file);
  })

  console.log(formData, " appended files");
  
  Array.from(files).forEach((file) => {
    createFileOnQueue(file.name);
  });
}

function createFileOnQueue(filename) {
  // Create the li element
  const liElement = document.createElement('li');
  liElement.classList.add('row');

  // Create the div.content element
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');

  // Create the div.file-details element
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('file-details');

  // Create the icon
  const iconElement = document.createElement('i');
  iconElement.classList.add('fas', 'fa-file-alt');

  // Create file div
  const fileDiv = document.createElement('div');
  detailsDiv.classList.add('file');

  const filenameSpan = document.createElement('span');
  filenameSpan.classList.add('filename');
  filenameSpan.textContent = `${filename}`;

  const statusSpan = document.createElement('span');
  statusSpan.classList.add('filename');
  statusSpan.textContent = `• Waiting Action`;

  fileDiv.appendChild(filenameSpan);
  fileDiv.appendChild(statusSpan);

  // Create the span.percent element
  const percentSpan = document.createElement('span');
  percentSpan.classList.add('percent');
  percentSpan.textContent = '50%';
  // TODO - SET THE PERCENTAGE OF THE UPLOAD

  // Append the <i> element to the div.file-details
  detailsDiv.appendChild(iconElement);
  // Append the span.filename and span.percent elements to the div.file-details
  detailsDiv.appendChild(fileDiv);
  detailsDiv.appendChild(percentSpan);

  // Create the div.progress-bar element
  const progressBarDiv = document.createElement('div');
  progressBarDiv.classList.add('progress-bar');

  // Create the div.current-progress element
  const currentProgressDiv = document.createElement('div');
  currentProgressDiv.classList.add('current-progress');
  // TODO -> SET THE WIDTH OF THE CURRENT PROGRESS DIV TO THE PERCENTAGE OF THE UPLOAD

  // Append the div.current-progress to the div.progress-bar
  progressBarDiv.appendChild(currentProgressDiv);

  // Append the div.file-details and div.progress-bar elements to the div.content
  contentDiv.appendChild(detailsDiv);
  contentDiv.appendChild(progressBarDiv);

  // Append the div.content element to the li element
  liElement.appendChild(contentDiv);
  liElement.id = filename;

  // APPEND TO QUEUE LIST
  queueList.appendChild(liElement);
}

// Handle submit
buttons.addEventListener('click', (event) => {
  console.log('click');
  command = event.srcElement.id

  // submitForm(
  //   'http://localhost:3001/handle-files?command=' + ,
  // );
});


form.addEventListener('submit', (e) => {
  e.preventDefault()

  fetch('http://localhost:3001/handle-files?command=' +  command, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data; charset=utf-8'
    },
    body: formData,
  })
})

function submitForm(path) {
  const data = new FormData(form);
  console.log("submit, ta errado")
  // console.log(data);
  // console.log(formData);
  // console.log(files);
  
  uploadFile(path, formData);
}

function uploadFile(path, data) {
  const xhr = new XMLHttpRequest(); // create a new XMLHttpRequest object
  xhr.open('POST', path, true); // set up the request

  xhr.setRequestHeader('enctype', 'multipart/form-data'); // set the enctype header
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // handle the response
      console.log(xhr.responseText);
    }
  };
  console.log({files: data});
  xhr.send(data);
}
