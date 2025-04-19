//let notaEnEdicionId = null; // Identificador temporal para saber si se está editando una nota

class NotasApp {
    constructor(itemsPorPagina = 5) {
        this.ITEMS_POR_PAGINA = itemsPorPagina;
        this.notaEnEdicionId = null;
        this.paginaActual = 1;
        this.notas = this.getNotas();
    }

    getNotas() {
        return JSON.parse(localStorage.getItem('notas')) || [];
    }

    saveNotas() {
        localStorage.setItem('notas', JSON.stringify(this.notas));
    }

    agregarNota(titulo, descripcion, categoria) {
        if (!titulo || !descripcion) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const nuevaNota = {
            titulo,
            descripcion,
            categoria,
            id: new Date().getTime(),
            fecha: new Date().toLocaleString()
        };

        this.notas.push(nuevaNota);
        this.saveNotas();
        this.cargarNotas();
    }

    cargarNotas() {
        const totalNotas = this.notas.length;
        const totalPaginas = Math.ceil(totalNotas / this.ITEMS_POR_PAGINA);
        const notasOrdenadas = [...this.notas].sort((a, b) => b.id - a.id);
        const notasPagina = notasOrdenadas.slice(
            (this.paginaActual - 1) * this.ITEMS_POR_PAGINA,
            this.paginaActual * this.ITEMS_POR_PAGINA
        );


        const notasContainer = document.getElementById('notas-container');
        const paginacionContainer = document.getElementById('paginacion');
        notasContainer.innerHTML = '';

        if (notasPagina.length === 0) {
            notasContainer.innerHTML = '<tr><td colspan="5" class="text-center">No tienes notas guardadas.</td></tr>';
            return;
        }

        notasPagina.forEach(nota => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${nota.titulo}</td>
                <td>${nota.descripcion}</td>
                <td>${nota.categoria}</td>
                <td>${nota.fecha}</td>
                <td>
                    <button class="btn btn-success btn-sm editar-btn" data-id="${nota.id}">Editar</button>
                    <button class="btn btn-danger btn-sm eliminar-btn" data-id="${nota.id}">Eliminar</button>
                </td>
            `;
            notasContainer.appendChild(fila);
        });

        paginacionContainer.innerHTML = `
            <li class="page-item ${this.paginaActual === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="app.cargarNotasPagina(1)">Anterior</button>
            </li>
            <li class="page-item ${this.paginaActual === totalPaginas ? 'disabled' : ''}">
                <button class="page-link" onclick="app.cargarNotasPagina(2)">Siguiente</button>
            </li>
        `;
    }

    cargarNotasPagina(direccion) {
        const totalNotas = this.notas.length;
        const totalPaginas = Math.ceil(totalNotas / this.ITEMS_POR_PAGINA);

        if (direccion === 1 && this.paginaActual > 1) {
            this.paginaActual--;
        } else if (direccion === 2 && this.paginaActual < totalPaginas) {
            this.paginaActual++;
        }

        this.cargarNotas();
    }

    eliminarNota(id) {
        this.notas = this.notas.filter(nota => nota.id !== id);
        this.saveNotas();
        this.cargarNotas();
    }

    editarNota(id) {
        const nota = this.notas.find(nota => nota.id === id);
    
        if (nota) {
            document.getElementById('nota-titulo').value = nota.titulo;
            document.getElementById('nota-descripcion').value = nota.descripcion;
            document.getElementById('nota-categoria').value = nota.categoria;
    
            this.notaEnEdicionId = id;
            document.getElementById('nota-submit').textContent = 'Guardar Edición';
        }
    }
}

// Instanciar la app
const app = new NotasApp();

// Cargar las notas al iniciar
window.onload = function () {
    app.cargarNotas();
};

// Delegar eventos de los botones de editar y eliminar
document.getElementById('notas-container').addEventListener('click', function (event) {
    if (event.target.classList.contains('editar-btn')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        app.editarNota(id);
    }

    if (event.target.classList.contains('eliminar-btn')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        app.eliminarNota(id);
    }
});

// Enviar formulario
document.getElementById('nota-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const titulo = document.getElementById('nota-titulo').value.trim();
    const descripcion = document.getElementById('nota-descripcion').value.trim();
    const categoria = document.getElementById('nota-categoria').value;

    if (!titulo || !descripcion) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    if (app.notaEnEdicionId !== null) {
        // Editar nota existente
        const index = app.notas.findIndex(nota => nota.id === app.notaEnEdicionId);
        if (index !== -1) {
            app.notas[index].titulo = titulo;
            app.notas[index].descripcion = descripcion;
            app.notas[index].categoria = categoria;
            app.notas[index].fecha = new Date().toLocaleString();
        }

        app.notaEnEdicionId = null;
        document.getElementById('nota-submit').textContent = 'Agregar Nota';
    } else {
        // Agregar nueva nota
        const nuevaNota = {
            titulo,
            descripcion,
            categoria,
            id: new Date().getTime(),
            fecha: new Date().toLocaleString()
        };

        app.notas.push(nuevaNota);
    }

    // Guardar y recargar
    app.saveNotas();
    app.cargarNotas();
    document.getElementById('nota-form').reset();
});