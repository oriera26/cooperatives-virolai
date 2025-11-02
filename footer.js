// footer.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("footer.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("No s'ha pogut carregar el footer.");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("footer-container-1").innerHTML = data;
        })
        .catch(error => console.error("Error carregant el footer:", error));
});