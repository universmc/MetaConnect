// Chargement du fichier JSON avec fetch
fetch('src/json/ctf_X-.json')
  .then(response => response.json())
  .then(data => {
    // Génération dynamique de la liste CTF
const list = data.menu.items.map(item => `<li>${item}</li>`).join('');
    const ctfContainer = document.getElementById('ctf-list');
    ctfContainer.innerHTML = list;
  })
  .catch(error => console.log(error));
