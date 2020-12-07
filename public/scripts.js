function paginate(selectedPage, totalPages) {
    let pages = [],
      oldPage;
  
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const firstAndLastPage = currentPage == 1 || currentPage == totalPages;
      const pagesAfterSelectedPage = currentPage <= selectedPage + 2;
      const pagesBeforeSelectedPage = currentPage >= selectedPage - 2;
  
      if (
        firstAndLastPage ||
        (pagesBeforeSelectedPage && pagesAfterSelectedPage)
      ) {
        if (oldPage && currentPage - oldPage > 2) {
          pages.push("...");
        }
        if (oldPage && currentPage - oldPage == 2) {
          page.push(oldPage + 1);
        }
        pages.push(currentPage);
        oldPage = currentPage;
      }
    }
  
    return pages;
  }
  
  
  function createPagination(pagination){
    const filter = pagination.dataset.filter;
  const page = +pagination.dataset.page;
  const total = +pagination.dataset.total;
  const pages = paginate(page, total);
  
  let elements = "";
  
  for (let page of pages) {
    if (String(page).includes("...")) {
      elements += `<span>${page}</span>`;
    } else {
          if (filter) {
                 elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`;
          } else {
              elements += `<a href="?page=${page}">${page}</a>`;
            }
      }
  }
  pagination.innerHTML = elements;
  
  }
  const pagination = document.querySelector(".pagination");
  
  if(pagination){
      createPagination(pagination)
  }
  
  

const cards = document.querySelectorAll('.card_link');

for (let i=0; i < cards.length; i++) {
    const recipe = cards[i]
    recipe.addEventListener('click', () => {
        window.location.href = `/admin/recipes/${i}`
    })
}

const showHidesIngredients = document.querySelectorAll('.topic-ingredients')

for (let showHidesIngredient of showHidesIngredients) {
    const buttonrecipe = showHidesIngredient.querySelector('h4')
    buttonrecipe.addEventListener('click', function (){
        if (buttonrecipe.innerHTML == "Esconder") {
            showHidesIngredient.querySelector('.ingredients').classList.add('hidden');
            buttonrecipe.innerHTML = "Mostrar"
        } else {
            showHidesIngredient.querySelector('.ingredients').classList.remove('hidden');
            buttonrecipe.innerHTML = "Esconder"
        }
    })
}

const showHidesPreparations = document.querySelectorAll('.topic-preparation')

for (let showHidesPreparation of showHidesPreparations) {
    const buttonPreparation = showHidesPreparation.querySelector('h4')
    buttonPreparation.addEventListener('click', function (){
        if (buttonPreparation.innerHTML == "Esconder") {
            showHidesPreparation.querySelector('.preparation').classList.add('hidden');
            buttonPreparation.innerHTML = "Mostrar"
        } else {
            showHidesPreparation.querySelector('.preparation').classList.remove('hidden');
            buttonPreparation.innerHTML = "Esconder"
        }
    })
}

const showHidesInformations = document.querySelectorAll('.topic-information')

for (let showHidesInformation of showHidesInformations) {
    const buttonInformation = showHidesInformation.querySelector('h4')
    buttonInformation.addEventListener('click', function (){
        if (buttonInformation.innerHTML == "Esconder") {
            showHidesInformation.querySelector('.information').classList.add('hidden');
            buttonInformation.innerHTML = "Mostrar"
        } else {
            showHidesInformation.querySelector('.information').classList.remove('hidden');
            buttonInformation.innerHTML = "Esconder"
        }
    })
}

function addIngredient() {
  const ingredients = document.querySelector("#ingredients");
  const fieldContainer = document.querySelectorAll(".ingredients");

  const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);

  if (newField.children[0].value == "") return false;

  newField.children[0].value = "";
  ingredients.appendChild(newField);
}

document
  .querySelector(".add-ingredient")
  .addEventListener("click", addIngredient);

  function addPreparation() {
    const preparations = document.querySelector("#preparations");
    const fieldContainer = document.querySelectorAll(".preparations");
  
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);
  
    if (newField.children[0].value == "") return false;
  
    newField.children[0].value = "";
    preparations.appendChild(newField);
  }
  
  document
    .querySelector(".add-preparation")
    .addEventListener("click", addPreparation);


const PhotosUpload = {
  uploadLimit: 5,
  handleFileInput(event) {
    const { files: fileList } = event.target
    const { uploadLimit } = PhotosUpload
    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`)
      event.preventDefault()
      return
    }

    Array.from(fileList).forEach(file => {
      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image()
        image.src = String(reader.results)

        const container = document.createElement('div')
        div.classList.add('photo')

        div.onclick = () => alert('remover foto')

        div.appendChild(image)

        document.querySelector('#photos-preview').appendChild(div)
      }
      reader.readAsDataURL(file)
    })
  }
}
