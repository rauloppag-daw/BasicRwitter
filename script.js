var ordPorLikes= false;

var ordLikes = false;
var ordAntiguo = false;
var ordNuevos = false;

class PublicacionComponente extends HTMLElement {

    constructor(codigo, email, nombre, cuerpo, likes, fecha) {
        super();
        this.codigo = codigo;
        this.email = email;
        this.nombre = nombre;
        this.cuerpo = cuerpo;
        this.likes = likes;
        this.fecha = fecha;
        this.shadow = this.attachShadow({mode: 'open'});
        }

    connectedCallback() {
    
    this.shadow.innerHTML = "";
    let plantilla = document.getElementById('publicacion'); 
    let plantillaContenido = plantilla.content;

    let emailUser = plantillaContenido.querySelector('#headerPubli > #emailUser');
    let contenido = plantillaContenido.querySelector('#contenido');
    let hora = plantillaContenido.querySelector('#hora');
    let likes = plantillaContenido.querySelector('#likes');
        
    emailUser.innerHTML = `<img class="icon" src="./img/user.png" style="width:45px; heigth:45px; margin-right:1%; margin-left: 1%; filter: invert();"/> <b>${this.nombre}   </b> <p style="color:lightgrey">(${this.email})</p>`;
    contenido.innerHTML = `<p style="width: 90%; margin-left: 1%;">${this.cuerpo}</p>`;
    likes.querySelector('#dislike').innerHTML = `<button   style="border: none; background-color: transparent; cursor:pointer;"> <img src="./img/dislike.png" style="padding-top: 1.5vh; filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;"/> </button>`;
    likes.querySelector('#cont').innerHTML = `<p> ${this.likes}</p>`;
    likes.querySelector('#like').innerHTML =  `<button style="border: none; background-color: transparent; cursor:pointer"> <img src="./img/like.png" style="filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;" /> </button>`;
    if(this.fecha == ''){
        hora.textContent = obtenerHoraFecha();
    }else{
        hora.textContent = this.fecha;
    }
    
    this.style.cursor = 'pointer';
   

    this.shadow.append(plantillaContenido.cloneNode(true));

    this.shadowRoot.querySelectorAll('#piepubli > #likes > #like > button')[0].addEventListener('click', ()=>{
        likearPubli(this.codigo, 1)
        .then((numlikes)=>{
            this.likes = numlikes;
            this.shadowRoot.querySelector('#cont').innerHTML = `<p> ${ this.likes }</p>`;
            console.log(this.likes)
        })
       
    })
    this.shadowRoot.querySelectorAll('#piepubli > #likes >  #dislike > button')[0].addEventListener('click', ()=>{
        likearPubli(this.codigo, -1)
        .then((numlikes)=>{
            this.likes = numlikes;
            this.shadowRoot.querySelector('#cont').innerHTML = `<p> ${ this.likes }</p>`;
            console.log(this.likes)
        })
    })

    this.shadowRoot.querySelector('#headerPubli> #editDelete > #borrarBtn').onclick = ()=>{
        borrarPubli(this.codigo);
    }

    this.shadowRoot.querySelector('#headerPubli> #editDelete > #editarBtn').onclick = ()=>{
        editarPubli(this.codigo, this.email, this.nombre, this.cuerpo);
    }
    

    }
}

// Registro del componente personalizado
customElements.define('publicacion-componente',PublicacionComponente);

function editarPubli(codigo, email,nombre, contenido){
    document.getElementById('publicar').style.display = 'none';
    document.getElementById('editar').style.display = 'block';

    document.forms.publi.nombre.value = nombre;
    document.forms.publi.email.value = email;
    document.forms.publi.cuerpo.value = contenido;

    document.getElementById('cortina').style.display= 'block';
    document.getElementById('formCont').style.display = 'grid';

    document.getElementById('editar').onclick = ()=>{
        nombre =  document.forms.publi.nombre.value;
        email =  document.forms.publi.email.value;
        contenido =  document.forms.publi.cuerpo.value;
        modificarPubliPost(codigo, email, nombre, contenido);
        document.forms.publi.nombre.value = "";
        document.forms.publi.email.value = "";
        document.forms.publi.cuerpo.value = "";
        document.getElementById('cortina').style.display= 'none';
        document.getElementById('formCont').style.display = 'none';
        document.getElementById('editar').style.display = 'none';
        document.getElementById('publicar').style.display = 'block';

    }
}

async function modificarPubliPost(codigo, email,nombre, contenido){
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=5',
    {
        method: 'PUT',
        headers:{
            "Content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({codigo: codigo, email : email, nombre: nombre, cuerpo: contenido })
    });

    if(conexion.ok){
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for(let i=0;i<resultado.length;i++){
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    }
}

function comprobarCampos(nombre, email, cuerpo){
    let errores = "";
    
        let incorrecto = true;
        if(nombre == ""){
            document.getElementsByClassName("error")[1].innerHTML =  "El nombre está vacío";  
            
            document.forms.publi.nombre.style.borderColor="red";
            incorrecto=false;
        }else{
            document.getElementsByClassName("error")[1].innerHTML =  "";  
            
            document.forms.publi.nombre.style.borderColor="whitesmoke";
        }
    
        if(!/^([a-z][a-z0-9]{2,})@([a-z0-9]{2,})\.([a-z]{2,3})$|^([a-z0-9]{2,})@((([a-z0-9]{2,})(\.{1})){1,})([a-z]{2,3})$/.test(email)){
            errores = errores + "El email es incorrecto \n";
            document.getElementsByClassName("error")[0].innerHTML =  "El email es incorrecto ";  
            document.forms.publi.email.style.borderColor="red";
            incorrecto=false;
        }else{
            document.getElementsByClassName("error")[0].innerHTML =  "";  
            
            document.forms.publi.email.style.borderColor="whitesmoke";
        }
    
        if(cuerpo == ""){
            document.getElementsByClassName("error")[2].innerHTML =  "El cuerpo está vacío  ";  
            document.forms.publi.cuerpo.style.borderColor="red";
            incorrecto=false;
        }else{
            document.getElementsByClassName("error")[2].innerHTML =  "";  
            document.forms.publi.cuerpo.style.borderColor="whitesmoke";
        }

        return incorrecto;
}

function anyadirPublicacion(){
   
    let nombre = document.forms.publi.nombre.value;
    let email = document.forms.publi.email.value;
    let cuerpo = document.forms.publi.cuerpo.value;

    
    incorrecto = comprobarCampos(nombre, email, cuerpo);

   
    
    if(incorrecto!=false){
        anyadirElementoPost(email, nombre, cuerpo)
            
            document.forms.publi.nombre.value = "";
            document.forms.publi.email.value= "";
            document.forms.publi.cuerpo.value = "";
        }
        

    
        
            
    }


function compararFecha(f1, f2){
    let arr1 = convertirArray(f1);
    let arr2 =  convertirArray(f2);
    console.log(arr1);
    let date1 = new Date(arr1[5], (arr1[4]-1), arr1[3], arr1[0],arr1[1],arr1[2]);
    let date2 = new Date(arr2[5], (arr2[4]-1), arr2[3], arr2[0],arr2[1],arr2[2]);


    if(date1>date2){
        return true;
    }else if(date1<date2){
        return false;
    }

    return true;

  }


document.getElementById('publicRweet').onclick = ()=>{
    document.getElementById('cortina').style.display= 'block';
    document.getElementById('formCont').style.display = 'grid';
}

document.getElementById('volver').onclick = ()=>{
    document.getElementById('cortina').style.display= 'none';
    document.getElementById('formCont').style.display = 'none';
    document.getElementById('editar').style.display = 'none';
    document.getElementById('publicar').style.display = 'block';
}

function obtenerHoraFecha(){
    let date = new Date();
    let fecha = date.getFullYear() + "-" +(date.getMonth()+1) + "-" + date.getDate();
    let hora = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minuto = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let segundos = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return  fecha + ' ' + hora + ":" + minuto + ":" + segundos ;
  }


  async function obtenerElementosGet(){
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=1');
    
    if(conexion.ok){
        let resultado = await conexion.json();
        for(let i=0;i<resultado.length;i++){
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();

    }else{
        alert('Error de red');
    }
}

async function anyadirElementoPost(email, nombre, cuerpo){
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=2',
    {
        method: 'POST',
        headers:{
            "Content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({email : email, nombre: nombre, cuerpo: cuerpo, likes: 0, fecha : obtenerHoraFecha() })
    });

    if(conexion.ok){
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for(let i=0;i<resultado.length;i++){
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
    }
    
}

async function likearPubli(codigo, val){
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=3',
    {
        method: 'PUT',
        headers:{
            "Content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({codigo: codigo, val: val })
    });

    if(conexion.ok){
        let numLikes = await conexion.text();
        return numLikes;
    }
    
}

async function borrarPubli(codigo){
    let conexion = await fetch('http://localhost/newTwitter/rwitter.php?function=4',
    {
        method: 'DELETE',
        headers:{
            "Content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({codigo: codigo})
    });

    if(conexion.ok){
        let resultado = await conexion.json();
        tablon.innerHTML = '';
        for(let i=0;i<resultado.length;i++){
            let publicacion = new PublicacionComponente(resultado[i]['codigo'], resultado[i]['email'], resultado[i]['nombre'], resultado[i]['cuerpo'], resultado[i]['likes'], resultado[i]['fecha']);
            tablon.appendChild(publicacion);
        }
        ordenarElementosEnFuncion();
}
}

function ordenarAntiguos(){
    ordPorLikes = false;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if(!ordAntiguo){
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = 'whitesmoke';
        ordAntiguo = true;
        ordNuevos = false;
        ordLikes = false;
    }

    for(let i=0;i<publicacionComponente.length;i++){
        arr.push(publicacionComponente[i]);
    }

    let ordenado = arr.sort(function(a,b){
        let shadow = a.shadowRoot.querySelector('#piepubli > #hora').textContent;        
        let shadow2 = b.shadowRoot.querySelector('#piepubli > #hora').textContent; 

        let date1 = new Date(shadow.split(' ')[0] + 'T' + shadow.split(' ')[1]);
        let date2 = new Date(shadow2.split(' ')[0] + 'T' + shadow2.split(' ')[1]);

        if(date1 > date2){
            return 1;
        }

        if(date1 < date2){
            return -1;
        }

        return 0;
    });

    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for(let i=0;i<ordenado.length;i++){
       tablon.append(ordenado[i]);
    }
    
}

function ordenarLikes(){
    ordPorLikes = true;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if(!ordLikes){
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = 'whitesmoke';
        ordLikes = true;
        ordAntiguo = false;
        ordNuevos = false;
    }
    
    for(let i=0;i<publicacionComponente.length;i++){
        arr.push(publicacionComponente[i]);
    }
    let ordenado = arr.sort(function(a,b){
        let shadow = Number(a.shadowRoot.querySelector('#piepubli > #likes > #cont').textContent);        
        let shadow2 = Number(b.shadowRoot.querySelector('#piepubli > #likes > #cont').textContent);
        
        if(shadow < shadow2){
            return 1;
        }

        if(shadow > shadow2){
            return -1;
        }

        return 0;
    });
    
    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for(let i=0;i<ordenado.length;i++){
       tablon.appendChild(ordenado[i]);
    }
    
    
  }

function ordenarNuevos(){
    ordPorLikes = false;
    let publicacionComponente = document.querySelector('#tablon').querySelectorAll('publicacion-componente');
    let arr = [];

    if(!ordNuevos){
        document.getElementsByClassName('ordBtn')[1].style.backgroundColor = '#d3668a';
        document.getElementsByClassName('ordBtn')[0].style.backgroundColor = 'whitesmoke';
        document.getElementsByClassName('ordBtn')[2].style.backgroundColor = 'whitesmoke';
        ordNuevos = true;
        ordAntiguo = false;
        ordLikes = false;
    }

    for(let i=0;i<publicacionComponente.length;i++){
        arr.push(publicacionComponente[i]);
    }

    let ordenado = arr.sort(function(a,b){
        let shadow = a.shadowRoot.querySelector('#piepubli > #hora').textContent;        
        let shadow2 = b.shadowRoot.querySelector('#piepubli > #hora').textContent; 

        let date1 = new Date(shadow.split(' ')[0] + 'T' + shadow.split(' ')[1]);
        let date2 = new Date(shadow2.split(' ')[0] + 'T' + shadow2.split(' ')[1]);
        

        if(date1 < date2){
            return 1;
        }

        if(date1 > date2){
            return -1;
        }

        return 0;
    });

    let tablon = document.getElementById('tablon');
    tablon.innerHTML = '';
    for(let i=0;i<ordenado.length;i++){
       tablon.append(ordenado[i]);
    }
    
}

function ordenarElementosEnFuncion(){
    if(ordAntiguo){
        ordenarAntiguos();
        console.log(0)
    }

    if(ordNuevos){
        ordenarNuevos();
    }

    if(ordLikes){
        ordenarLikes();
    }

    if(!ordAntiguo && !ordNuevos && !ordLikes){
        ordenarNuevos();
    }
}

obtenerElementosGet();