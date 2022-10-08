const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) => {
  const file = e.target.files[0];
  if (!isFileImage(file))
  {
    alertError('Please select an Image');
    return;
  }

  //Getting Original Dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function() {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  // console.log('Success!');
  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'Resized Images');
}

//Send Image data to main 
const sendImage = (e) => {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0])
  {
    alertError('Please Upload an Image');
    return;
  }
  if (width === '' || height === '')
  {
    alertError('Please fill in both height and width');
    return;
  }

  //Send to main using IPC renderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  });
}

//Catch the Image Done Event
ipcRenderer.on('image:done', () => {
  alertSuccess('Image Resized Successfully');
});

//Make Sure file is Image
const isFileImage = (file) => {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

const alertError = (message) => {
  Toastify.toast({
    text: message,
    duration: 4000, 
    close: false,
    style:
    {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  });
}
const alertSuccess = (message) => {
  Toastify.toast({
    text: message,
    duration: 5000, 
    cloase: false,
    style:
    {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  });
}
img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);