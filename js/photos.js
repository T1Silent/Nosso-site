// ==== Importando Firebase SDK ==== //
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-storage.js";

// ==== Pegando Firebase do window (já inicializado no HTML) ==== //
const db = window.db;
const storage = window.storage;

// ==== Referências dos elementos ==== //
const photoInput = document.getElementById("photoInput");
const addPhotosBtn = document.getElementById("addPhotos");
const gallery = document.getElementById("gallery");

// ==== Upload da(s) foto(s) ==== //
addPhotosBtn.addEventListener("click", async () => {
  const files = photoInput.files;
  if (!files.length) return alert("Selecione pelo menos uma foto!");

  for (let file of files) {
    try {
      const fileRef = ref(storage, `fotos/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, "fotos"), {
        url,
        uploadedAt: Date.now()
      });

      console.log("Foto enviada:", file.name);
    } catch (err) {
      console.error("Erro ao enviar foto:", err);
    }
  }

  photoInput.value = ""; // limpa seleção depois do upload
});

// ==== Mostrar galeria em tempo real ==== //
const q = query(collection(db, "fotos"), orderBy("uploadedAt", "desc"));
onSnapshot(q, (snapshot) => {
  gallery.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const img = document.createElement("img");
    img.src = data.url;
    img.className = "gallery-img";
    gallery.appendChild(img);
  });
});
