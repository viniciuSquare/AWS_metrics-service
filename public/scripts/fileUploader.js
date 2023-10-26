const forms = [
  {
    id: 'capacity-form',
    title: 'AWS Capacity - Upload CSV para processamento',
    endpoint: 'handle-files',
    customFields: [{ key: 'produto', default: 'save-metrics', hidden: true }],
    showQueue: true,
    data: [],
  },
  {
    id: 'billing-form',
    title: 'AWS Billing - Upload CSV para processamento',
    endpoint: 'budget',
    customFields: [{ key: 'produto' }],
    showQueue: true,
    data: [],
  },
];

const formsContainer = document.getElementById('forms-container');
const reader = new FileReader();

const currentFormIndex = null;

function createForms() {
  forms.forEach((formMetadata, index) => {
    // RENDER HTML
    const formHtml = `
      <h2 class="title">${formMetadata.title}</h2>
      <form 
        enctype="multipart/form-data" id="${formMetadata.id}"
      >
        <div
          id="${formMetadata.id}-file-selector"
          class="file-selector-wrapper"
        >
          <input
            id="${formMetadata.id}-file-selector-input"
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv"
            required
            multiple
            hidden
          />
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Selecione arquivos para serem importados</p>
        </div>
        <button type="submit" class="save-metrics">Save Metrics</button>
      </form>
      ${
        formMetadata.showQueue
          ? `<div class="separator"></div>
        <!-- PROGRESS -->
        <section class="progress" id="${formMetadata.id}-queue-list">
          <!-- FEED BY SELECTED FILES -->
        </section>`
          : ''
      }
    `;

    const formWrapper = document.createElement('div');
    formWrapper.classList.add('wrapper');
    formWrapper.innerHTML = formHtml;

    formsContainer.appendChild(formWrapper);
  });
}

function registerForms() {
  forms.forEach((formMetadata, index) => {
    registerSelectorListeners(index);
  });
}

function registerSelectorListeners(formIndex) {
  const fileSelectorDiv = document.getElementById(
    `${forms[formIndex].id}-file-selector`,
  );
  const fileSelectorInput = document.getElementById(
    `${forms[formIndex].id}-file-selector-input`,
  );

  const form = document.getElementById(forms[formIndex].id);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm(forms[formIndex].data).then((data) =>
      console.log('Submit response: ', data),
    );

    console.log('Submitted?!');
  });

  form.addEventListener('change', (event) => {
    console.log('Changed!', event.target.files);

    // if (!event.target.files) console.error('No file uploaded');

    handleSelectorFiles(fileSelectorInput, formIndex);
  });

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

    fileSelectorInput.files = event.dataTransfer.files;

    handleSelectorFiles(fileSelectorInput, formIndex);

    console.debug(
      'Files dropped! \nEvent data:',
      event.dataTransfer.files,
      '\nForm data:',
      forms[formIndex].data,
    );
  });
}

function handleSelectorFiles(inputElement, index) {
  // UPDATE GLOBAL INDEX
  currentFormIndex = index;

  console.log(currentFormIndex);
  console.log(inputElement, forms[currentFormIndex].data);

  for (const file of inputElement.files) {
    // INITIATE DATA OBJ
    forms[currentFormIndex].data.push({
      title: file.tile
    })

    // READ THE FILES - DATA IS ADDED TO `forms` ON `reader` REGISTERED LOAD LISTENER
    reader.readAsText(file);

    console.log(file);
  }

  console.log(forms[currentFormIndex].data, ' appended files');
  createFileOnQueue(forms[currentFormIndex]);
}

function submitForm(data) {
  const xhr = new XMLHttpRequest(); // create a new XMLHttpRequest object
  xhr.open('POST', 'http://127.0.0.1:5501/upload', true); // set up the request

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // handle the successful response
        console.log(xhr.responseText);
      } else {
        // handle errors
        console.error('Upload failed with status:', xhr.status);
      }
    }
  };

  xhr.send(data); // send the FormData with the files to the server
}

function createFileOnQueue(formMetadata) {
  console.debug('To create files on queue', formMetadata);

  formMetadata.data.files.map((file) => {
    console.debug(file);
  });

  // createQueueElement(filename);
}

function createQueueElement(filename) {
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

function registerReaderListener() {
  console.log('registerReaderListener')

  reader.addEventListener(
    'load',
    () => {
      console.log(forms[currentFormIndex].data);
      
      let lastFormDataAdded = forms[currentFormIndex].data.length-1;

      forms[currentFormIndex].data[lastFormDataAdded].data = test.target.result.replace(/\/"/g, '');
    },
    false,
  );
}

createForms();
registerForms();
registerReaderListener();

// function registerForm(formId) {
//   // * ELEMENTS SELECTORS
//   const form = document.getElementById(formId);
//   // Select children
//   // buttons
//   // queue list
//   const buttons = document.getElementById('buttons');

//   const queueList = document.getElementById('queue-list');

//   const fileSelectorDiv = document.getElementById('capacity-file-selector');
//   const fileSelectorInput = document.getElementById('capacity-file-selector-input');
// }
