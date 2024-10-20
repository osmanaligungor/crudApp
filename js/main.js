// console.log("for controls");

// ! Düzenleme(edit) Modu Değişkenleri
let editMode = false; // Düzenleme modunu belirleyecek değişken
let editItem; // Düzenleme elemanını belirleyecek değişken
let editItemId; // Düzenleme elemanının id si

// * HTML'den elemanları çağırma
const form = document.querySelector(".form-wrapper");
const input = document.querySelector("#input");
const itemList = document.querySelector(".item-list");
const alert = document.querySelector(".alert");
const addButton = document.querySelector(".submit-btn");
const clearButton = document.querySelector(".clear-btn");
// console.log(form, input);

// ! Fonksiyonlar

// * Form Gönderildiğinde çalışacak fonksiyon

// function addItem() {}
const addItem = (e) => {
  //sayfanın yenilenmesini iptal etmek için e.preventDefault(); kullandık.
  e.preventDefault();
  const value = input.value;
  if (value !== "" && !editMode) {
    // silme işlemi için benzersiz değere ihtiyacımız olduğu için bunun için id oluşturduk. Bunu da new Date().getTime(); ile elde ediyoruz.
    const id = new Date().getTime().toString();
    // console.log(id);
    // createElement çalıştığında benzersiz değer olan id 'yi ve değerini alması gerekir. Çünkü silme işlemlerinde bunları birbiriyle bağdaştırmamız lazım.
    createElement(id, value);
    setToDefault();
    showAlert("Added Succesfully", "success");
    addToLocalStorage(id, value);
    clearButton.style.display = "grid";
  } else if (value !== "" && editMode) {
    editItem.innerHTML = value;
    updateLocalStorage(editItemId, value);
    showAlert("Update Succesfully", "success");
    setToDefault();
  }
};

// * Eleman eklenince/silince uyarı veren fonksiyon

const showAlert = (text, action) => {
  // alert kısmının içeriğini belirledik
  alert.textContent = `${text}`;
  // alert kısmına class ekledik
  alert.classList.add(`alert-${action}`);
  // alert kısmının içeriğini güncelle ve eklenen classı kaldırdık.
  setTimeout(() => {
    alert.textContent = "";
    alert.classList.remove(`alert-${action}`);
  }, 2000);
};

// * Elemanları silen fonksiyon

const deleteItem = (e) => {
  // Silmek istenen elemana eriş
  const element = e.target.parentElement.parentElement.parentElement;
  const id = element.dataset.id;
  // Bu elemanı kaldır
  itemList.removeChild(element);
  removeFromLocalStorage(id);
  showAlert("Item Delete Succesfully", "danger");
  // eğer hiç eleman yoksa clear list butonunu kaldır.
  if (!itemList.children.length) {
    clearButton.style.display = "none";
  }
};

// * Elemanları güncelleyecek fonksiyon

const editItems = (e) => {
  // Komple silme işlemi yapacak olsaydık aşağıdaki gibi elemente erişmemiz gerekiyordu. Ancak düzenleme işlemi yapacağımız için düzenleme yapılacak elemente ulaşmamız gerekiyor.
  const element = e.target.parentElement.parentElement.parentElement;
  // Düzenleme yapacağımız için yani komple silmiyoruz, düzenleme yapılacak yazıyı düzenleyeceğimiz p elementine ulaşmak için previousElementSibling kullanıyoruz. Bu kardeş element demek.
  editItem = e.target.parentElement.parentElement.previousElementSibling;
  input.value = editItem.innerText;
  editMode = true;
  editItemId = element.dataset.id;
  addButton.textContent = "Edit";
};

// * Varsayılan değerlere döndüren fonksiyon
const setToDefault = () => {
  input.value = "";
  editMode = false;
  editItemId = "";
  addButton.textContent = "Add";
};

// * Sayfa yüklendiğinde elemanları render edecek fonksiyon
const renderItems = () => {
  let items = getFromLocalStorage();
  // console.log(items);
  if (items.length > 0) {
    items.forEach((item) => createElement(item.id, item.value));
    clearButton.style.display = "grid";
  } else {
    clearButton.style.display = "none";
  }
};

// * Eleman oluşturan fonksiyon

// ekleyeceğimiz her bilgi için yeni bir div oluşturacağız.
const createElement = (id, value) => {
  // yeni bir div oluşturduk
  const newDiv = document.createElement("div");
  // bu dive attribute ekleyecez(Benzersiz bir id ekledik.Çünkü silme işlemlerinde gerekli olacak.) // ! ("data-id", id) ile Bu özellik bizden eklenecek özelliğin adını ve bu özelliğin değerini ister. Yani data-id isminde id veriyoruz.
  newDiv.setAttribute("data-id", id);
  // bu dive class ekleyecez
  newDiv.classList.add("items-list-item");
  // bu divin HTML içeriğini belirleyeceğiz
  newDiv.innerHTML = `
            <p class="item-name">${value}</p>
            <div class="btn-container">
                <button class="edit-btn">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="delete-btn">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
  `;

  // delete butonuna erişmek için aşağıdaki gibi atama yapmamız lazım. Çünkü Html de böyle bir classa sahip bir element yok. createElement(); i çalıştırdığımız zaman böyle bir element oluşuyor. Dolayısıyla aşağıdaki gibi yapmamız gerekiyor.
  const deleteBtn = newDiv.querySelector(".delete-btn");
  // console.log(deleteBtn);
  deleteBtn.addEventListener("click", deleteItem);
  // edit butonuna eriş
  const editBtn = newDiv.querySelector(".edit-btn");
  // console.log(editBtn);
  editBtn.addEventListener("click", editItems);

  itemList.appendChild(newDiv);
  showAlert("Added Succesfully", "success");
};

// * Clear list e basıldığında sıfırlama yapan fonksiyon

const clearItems = () => {
  const items = document.querySelectorAll(".items-list-item");
  if (items.length > 0) {
    items.forEach((item) => {
      itemList.removeChild(item);
    });
    clearButton.style.display = "none";
    showAlert("Empty list!", "danger");
    // Localstorage ı temizlemek için yazdık.
    localStorage.removeItem("items");
  }
};

// ! Localstorage a kayıt yapan fonksiyon
const addToLocalStorage = (id, value) => {
  // dağıtma işlemi yaptık
  // yukarıda addToLocalStorage = (id, value) =>{} şeklinde bir fonksiyon tanımladık. Javascriptin eski sürümlerinde item = { id:id, value:value } şeklinde yazmamız gerekiyordu. Ancak vereceğimiz değerler aynıysa önemli olan nokta da bu aynı değerler vereceksek aşağıdaki gibi yazmamız yeterli.
  const item = { id, value };
  let items = getFromLocalStorage();
  items.push(item);
  // localstorage a eklemek için string formatta olması lazım dolayısıyla JSON.stringify(item) şeklinde değerleri çevirdik.
  localStorage.setItem("items", JSON.stringify(items));
};

// ! Localstorage dan verileri alan fonksiyon
const getFromLocalStorage = () => {
  // tekrardan kullanacağımız veri tipine çeviriyoruz. Bunu da JSON.parse(localStorage.getItem("items")) ile yapıyoruz.
  // console.log(JSON.parse(localStorage.getItem("items")));
  return localStorage.getItem("items")
    ? JSON.parse(localStorage.getItem("items"))
    : [];
  // yukarıda yaptığımız işlem : eğer localStorage.getItem("items") items i localstorage dan alırsan JSON.parse(localStorage.getItem("items")) items i dönüştür. items i alamazsan [] boş dizi ver.
};

// * Localstorage dan verileri kaldıran fonksiyon
const removeFromLocalStorage = (id) => {
  let items = getFromLocalStorage();
  // filter metodu istemediğimiz koşula göre çalışır.
  items = items.filter((item) => item.id !== id);
  localStorage.setItem("items", JSON.stringify(items));
};

// Localstorage ı güncelleyen fonksiyon
const updateLocalStorage = (id, newValue) => {
  let items = getFromLocalStorage();
  items = items.map((item) => {
    if (item.id === id) {
      // * Spread Operatör : Bu özellik bir elemanı güncellerken veri kaybını önlemek için kullanılır.
      // Burada value kısmını güncelledik, bunun dışında kalan items özelliklerini ise sabit tuttuk.Bu satırda, mevcut item nesnesini yayarak (...item) yeni bir nesne oluşturulur ve sadece value özelliği newValue ile güncellenir. Diğer tüm özellikler olduğu gibi kalır.
      return { ...item, value: newValue };
    }
    return item;
  });
  localStorage.setItem("items", JSON.stringify(items));
};

// ? Olay izleyicileri
// Formun gönderildiği anı yakalamaya yarar
form.addEventListener("submit", addItem);
// Sayfanın yüklendiği anı yakalar
window.addEventListener("DOMContentLoaded", renderItems);
// Clear list butonuna tıklandığında
clearButton.addEventListener("click", clearItems);
