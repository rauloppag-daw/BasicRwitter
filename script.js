var ordPorLikes = false;
var ordAntiguo = false;
var ordNuevos = false;
var ordLikes = false;

// Registro del componente personalizado
/**
 * Componente web que contiene el email, nombre, contenido, y sistema de likes
 */
class PublicacionComponente extends HTMLElement {
    constructor(codigo, email, nombre, cuerpo, likes, fecha) {
        super();
        this.codigo = codigo;
        this.email = email;
        this.nombre = nombre;
        this.cuerpo = cuerpo;
        this.likes = likes;
        this.fecha = fecha;
        this.shadow = this.attachShadow({ mode: 'open' });
    }


    connectedCallback() {
        //Borrado del contenido del shadow
        this.shadow.innerHTML = "";
        //Obtenemos plantilla
        let plantilla = document.getElementById('publicacion');
        let plantillaContenido = plantilla.content;

        //Separación de los elementos de la plantilla
        let emailUser = plantillaContenido.querySelector('#headerPubli > #emailUser');
        let contenido = plantillaContenido.querySelector('#contenido');
        let hora = plantillaContenido.querySelector('#hora');
        let likes = plantillaContenido.querySelector('#likes');

        //Asignamos los atributos a los contenidos de la plantilla
        emailUser.innerHTML = `<img class="icon" src="./img/user.png" style="width:45px; heigth:45px; margin-right:1%; margin-left: 1%; filter: invert();"/> <b>${this.nombre}   </b> <p style="color:lightgrey">(${this.email})</p>`;
        contenido.innerHTML = `<p style="width: 90%; margin-left: 1%;">${this.cuerpo}</p>`;
        likes.querySelector('#dislike').innerHTML = `<button   style="border: none; background-color: transparent; cursor:pointer;"> <img src="./img/dislike.png" style="padding-top: 1.5vh; filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;"/> </button>`;
        likes.querySelector('#cont').innerHTML = `<p> ${this.likes}</p>`;
        likes.querySelector('#like').innerHTML = `<button style="border: none; background-color: transparent; cursor:pointer"> <img src="./img/like.png" style="filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;" /> </button>`;

        //Asignamos la fecha, en caso de no existir se asigna y si existe se deja la que estaba.
        if (this.fecha == '') {
            hora.textContent = obtenerHoraFecha();
        } else {
            hora.textContent = this.fecha;
        }
        //Se añade el contenido de la plantilla al shadow
        this.shadow.append(plantillaContenido.cloneNode(true));

        //Sistema de añadir likes
        this.shadowRoot.querySelectorAll('#piepubli > #likes > #like > button')[0].addEventListener('click', () => {
            likearPubli(this.codigo, 1)
                .then((numlikes) => {
                    this.likes = numlikes;
                    this.shadowRoot.querySelector('#cont').innerHTML = `<p> ${this.likes}</p>`;
                });

        });

        //Sistema de añadir dislikes
        this.shadowRoot.querySelectorAll('#piepubli > #likes >  #dislike > button')[0].addEventListener('click', () => {
            likearPubli(this.codigo, -1)
                .then((numlikes) => {
                    this.likes = numlikes;
                    this.shadowRoot.querySelector('#cont').innerHTML = `<p> ${this.likes}</p>`;
                });
        });
        //Sistema de borrado de publicaciones
        this.shadowRoot.querySelector('#headerPubli> #editDelete > #borrarBtn').onclick = () => {
            borrarPubli(this.codigo);
        }

        //Sistema de edición de publicaciones
        this.shadowRoot.querySelector('#headerPubli> #editDelete > #editarBtn').onclick = () => {
            editarPubli(this.codigo, this.email, this.nombre, this.cuerpo);
        }
    }
}

customElements.define('publicacion-componente', PublicacionComponente);

/**
 * Función que prepara el formulario para editar una publicación y conectar con el metodo asincrono que conecta con el back
 * @param {*} codigo 
 * @param {*} email 
 * @param {*} nombre 
 * @param {*} contenido 
 */
function editarPubli(codigo, email, nombre, contenido) {

    document.getElementById('publicar').style.display = 'none';
    document.getElementById('editar').style.display = 'block';

    document.forms.publi.nombre.value = nombre;
    document.forms.publi.email.value = email;
    document.forms.publi.cuerpo.value = contenido;

    mostrarForm();

    document.getElementById('editar').onclick = () => {

        nombre = document.forms.publi.nombre.value;
        email = document.forms.publi.email.value;
        contenido = document.forms.publi.cuerpo.value;
        let incorrecto = comprobarCampos(nombre, email, contenido);
        if(incorrecto){
            modificarPubliPost(codigo, email, nombre, contenido);

            vaciarFormulario();
    
            esconderForm();
            document.getElementById('editar').style.display = 'none';
            document.getElementById('publicar').style.display = 'block';
        }
        
    }
}
/**
 * Método asincrono que edita una publicación mediante método PUT
 * @param {*} codigo 
 * @param {*} email 
 * @param {*} nombre 
 * @param {*} contenido 
 */
async function modificarPubliPost(codigo, email, nombre, contenido) {
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=5',
        {
            method: 'PUT',
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ codigo: codigo, email: email, nombre: nombre, cuerpo: contenido })
        });

    if (conexion.ok) {
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for (let i = 0; i < resultado.length; i++) {
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    }
}
/**
 * Comprueba los campos del formulario
 * @param {*} nombre 
 * @param {*} email 
 * @param {*} cuerpo 
 * @returns 
 */
function comprobarCampos(nombre, email, cuerpo) {
    let errores = "";

    let incorrecto = true;
    if (nombre == "") {
        document.getElementsByClassName("error")[1].innerHTML = "El nombre está vacío";

        document.forms.publi.nombre.style.borderColor = "red";
        incorrecto = false;
    } else {
        document.getElementsByClassName("error")[1].innerHTML = "";

        document.forms.publi.nombre.style.borderColor = "whitesmoke";
    }

    if (!/^([a-z][a-z0-9]{2,})@([a-z0-9]{2,})\.([a-z]{2,3})$|^([a-z0-9]{2,})@((([a-z0-9]{2,})(\.{1})){1,})([a-z]{2,3})$/.test(email)) {
        errores = errores + "El email es incorrecto \n";
        document.getElementsByClassName("error")[0].innerHTML = "El email es incorrecto ";
        document.forms.publi.email.style.borderColor = "red";
        incorrecto = false;
    } else {
        document.getElementsByClassName("error")[0].innerHTML = "";
        document.forms.publi.email.style.borderColor = "whitesmoke";
    }

    if (cuerpo == "") {
        document.getElementsByClassName("error")[2].innerHTML = "El cuerpo está vacío  ";
        document.forms.publi.cuerpo.style.borderColor = "red";
        incorrecto = false;
    } else {
        document.getElementsByClassName("error")[2].innerHTML = "";
        document.forms.publi.cuerpo.style.borderColor = "whitesmoke";
    }

    return incorrecto;
}

/**
 * Añade una nueva publicacion dados los datos de un formulario
 */
function anyadirPublicacion() {

    let nombre = document.forms.publi.nombre.value;
    let email = document.forms.publi.email.value;
    let cuerpo = document.forms.publi.cuerpo.value;

    let incorrecto = comprobarCampos(nombre, email, cuerpo);

    if (incorrecto != false) {
        anyadirElementoPost(email, nombre, cuerpo);
        vaciarFormulario();
    }
}

/**
 * Compara dos fechas de la clase Date
 * @param {*} f1 
 * @param {*} f2 
 * @returns 
 */
function compararFecha(f1, f2) {
    let arr1 = convertirArray(f1);
    let arr2 = convertirArray(f2);

    let date1 = new Date(arr1[5], (arr1[4] - 1), arr1[3], arr1[0], arr1[1], arr1[2]);
    let date2 = new Date(arr2[5], (arr2[4] - 1), arr2[3], arr2[0], arr2[1], arr2[2]);

    if (date1 > date2) {
        return true;
    } else if (date1 < date2) {
        return false;
    }

    return true;
}

/**
 * Evento onclick que muestra el formulario para añadirlo
 */
document.getElementById('publicRweet').onclick = () => {
    mostrarForm();
}
/**
 * Evento onclick que esconde y reinicia el formulario
 */
document.getElementById('volver').onclick = () => {
    esconderForm();
    document.getElementById('editar').style.display = 'none';
    document.getElementById('publicar').style.display = 'block';
    vaciarFormulario();
    reiniciarForm();
}
/**
 * Obtiene la hora y fecha actual y las construye en un string
 * @returns 
 */
function obtenerHoraFecha() {
    let date = new Date();
    let fecha = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let hora = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minuto = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let segundos = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return fecha + ' ' + hora + ":" + minuto + ":" + segundos;
}
/**
 * Obtiene todas las publicaciones del backend mediante una petición GET
 */
async function obtenerElementosGet() {
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=1');

    if (conexion.ok) {
        let resultado = await conexion.json();
        for (let i = 0; i < resultado.length; i++) {
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    } else {
        alert('Error de red');
    }
}
/**
 * Añade publicación al backend mediante método POST
 * @param {*} email 
 * @param {*} nombre 
 * @param {*} cuerpo 
 */
async function anyadirElementoPost(email, nombre, cuerpo) {
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=2',
        {
            method: 'POST',
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ email: email, nombre: nombre, cuerpo: cuerpo, likes: 0, fecha: obtenerHoraFecha() })
        });

    if (conexion.ok) {
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for (let i = 0; i < resultado.length; i++) {
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    }
}
/**
 * Método que añade o quita un like en el backend mediante el método PUT
 * @param {*} codigo 
 * @param {*} val 
 * @returns 
 */
async function likearPubli(codigo, val) {
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=3',
        {
            method: 'PUT',
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ codigo: codigo, val: val })
        });

    if (conexion.ok) {
        let numLikes = await conexion.text();
        return numLikes;
    }

}
/**
 * Borra una publicación dado un código en el backend mediante metodo DELETE
 * @param {*} codigo 
 */
async function borrarPubli(codigo) {
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=4',
        {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ codigo: codigo })
        });

    if (conexion.ok) {
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for (let i = 0; i < resultado.length; i++) {
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    }
}
/**
 * Ordena los elementos de más antiguos a más recientes
 */
function ordenarAntiguos() {
    ordPorLikes = false;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if (!ordAntiguo) {
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = 'whitesmoke';
        definirBotonesOrdenamiento([true, false, false]);
    }

    for (let i = 0; i < publicacionComponente.length; i++) {
        arr.push(publicacionComponente[i]);
    }

    let ordenado = arr.sort(function (a, b) {
        let shadow = a.shadowRoot.querySelector('#piepubli > #hora').textContent;
        let shadow2 = b.shadowRoot.querySelector('#piepubli > #hora').textContent;

        let date1 = new Date(shadow.split(' ')[0] + 'T' + shadow.split(' ')[1]);
        let date2 = new Date(shadow2.split(' ')[0] + 'T' + shadow2.split(' ')[1]);

        if (date1 > date2) {
            return 1;
        }

        if (date1 < date2) {
            return -1;
        }

        return 0;
    });

    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for (let i = 0; i < ordenado.length; i++) {
        tablon.append(ordenado[i]);
    }

}
/**
 * Ordena los elementos con más likes a menos likes
 */
function ordenarLikes() {
    ordPorLikes = true;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if (!ordLikes) {
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = 'whitesmoke';
        definirBotonesOrdenamiento([false, false, true]);
    }

    for (let i = 0; i < publicacionComponente.length; i++) {
        arr.push(publicacionComponente[i]);
    }
    let ordenado = arr.sort(function (a, b) {
        let shadow = Number(a.shadowRoot.querySelector('#piepubli > #likes > #cont').textContent);
        let shadow2 = Number(b.shadowRoot.querySelector('#piepubli > #likes > #cont').textContent);

        if (shadow < shadow2) {
            return 1;
        }

        if (shadow > shadow2) {
            return -1;
        }
        return 0;
    });

    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for (let i = 0; i < ordenado.length; i++) {
        tablon.appendChild(ordenado[i]);
    }
}
/**
 * Ordena los elementos de más recientes a más nuevos
 */
function ordenarNuevos() {
    ordPorLikes = false;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if (!ordNuevos) {
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = 'whitesmoke';
        definirBotonesOrdenamiento([false, true, false]);
    }

    for (let i = 0; i < publicacionComponente.length; i++) {
        arr.push(publicacionComponente[i]);
    }

    let ordenado = arr.sort(function (a, b) {
        let shadow = a.shadowRoot.querySelector('#piepubli > #hora').textContent;
        let shadow2 = b.shadowRoot.querySelector('#piepubli > #hora').textContent;

        let date1 = new Date(shadow.split(' ')[0] + 'T' + shadow.split(' ')[1]);
        let date2 = new Date(shadow2.split(' ')[0] + 'T' + shadow2.split(' ')[1]);


        if (date1 < date2) {
            return 1;
        }

        if (date1 > date2) {
            return -1;
        }

        return 0;
    });

    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for (let i = 0; i < ordenado.length; i++) {
        tablon.append(ordenado[i]);
    }

}
/**
 *  Función que cada vez que se añade un elemento se ejecuta para reordenar todas las publicaciones
 */
function ordenarElementosEnFuncion() {
    if (ordAntiguo) {
        ordenarAntiguos();
    }

    if (ordNuevos) {
        ordenarNuevos();
    }

    if (ordLikes) {
        ordenarLikes();
    }

    if (!ordAntiguo && !ordNuevos && !ordLikes) {
        ordenarNuevos();
    }
}
/**
 * Método para controlar el estilo de los botones de ordenamiento
 * @param {*} arr 
 */
function definirBotonesOrdenamiento(arr) {
    ordAntiguo = arr[0];
    ordNuevos = arr[1];
    ordLikes = arr[2];
}
/**
 * Función que vacia los campos del formulario
 */
function vaciarFormulario() {
    document.forms.publi.nombre.value = "";
    document.forms.publi.email.value = "";
    document.forms.publi.cuerpo.value = "";
}
/**
 * Esconde mediante estilos el formulario
 */
function esconderForm() {
    document.getElementById('cortina').style.display = 'none';
    document.getElementById('formCont').style.display = 'none';
}
/**
 * Muestra el formulario
 */
function mostrarForm() {
    document.getElementById('cortina').style.display = 'block';
    document.getElementById('formCont').style.display = 'grid';
}
/**
 * Reinicia los mensajes de errores del formulario
 */
function reiniciarForm(){
    let errores = document.getElementsByClassName('error');
    
    for(let i=0;i<errores.length;i++){
        errores[i].innerHTML = '';
    }
    document.forms.publi.nombre.style.borderColor = "whitesmoke";
    document.forms.publi.email.style.borderColor = "whitesmoke";
    document.forms.publi.cuerpo.style.borderColor = "whitesmoke";
}

obtenerElementosGet();