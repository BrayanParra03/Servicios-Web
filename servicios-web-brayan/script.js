function cargarUsuarios() {
    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(data => {
            let resultado = document.getElementById('resultado');
            resultado.innerHTML = "";

            data.forEach(usuario => {
                resultado.innerHTML += `
                    <div class="user-card">
                        <h4>${usuario.name}</h4>
                        <p>${usuario.email}</p>
                    </div>
                `;
            });
        })
        .catch(error => console.error('Error:', error));
}