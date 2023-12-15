var ordPorLikes= false;
class PublicacionComponente extends HTMLElement {
    constructor(email, nombre, cuerpo) {
    super();
    this.email = email;
    this.nombre = nombre;
    this.cuerpo = cuerpo;
    this.likes = 0;
    }

    connectedCallback() {
    const shadow = this.attachShadow({mode: 'open'});
    let plantilla = document.getElementById('publicacion'); 
    let plantillaContenido = plantilla.content;

    let emailUser = plantillaContenido.querySelector('#emailUser');
    let contenido = plantillaContenido.querySelector('#contenido');
    let hora = plantillaContenido.querySelector('#hora');
    let likes = plantillaContenido.querySelector('#likes');
        
    emailUser.innerHTML = `<img class="icon" src="./img/user.png" style="width:45px; heigth:45px; margin-right:1%; margin-left: 1%; filter: invert();"/> <b>${this.nombre}   </b> <p style="color:lightgrey">(${this.email})</p>`;
    contenido.innerHTML = `<p style="width: 90%; margin-left: 1%;">${this.cuerpo}</p>`;
    likes.querySelector('#dislike').innerHTML = `<button   style="border: none; background-color: transparent; cursor:pointer;"> <img src="./img/dislike.png" style="padding-top: 1.5vh; filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;"/> </button>`;
    likes.querySelector('#cont').innerHTML = `<p> ${this.likes}</p>`;
    likes.querySelector('#like').innerHTML =  `<button style="border: none; background-color: transparent; cursor:pointer"> <img src="./img/like.png" style="filter: invert(); width:25px; heigth:25px; margin-right:1%; margin-left: 1%;" /> </button>`;
    hora.textContent = obtenerHoraFecha();
    this.style.cursor = 'pointer';
   

    shadow.append(plantillaContenido.cloneNode(true));

    this.shadowRoot.querySelectorAll('#piepubli > #likes > #like > button')[0].addEventListener('click', ()=>{
        this.likes++;
        this.shadowRoot.querySelector('#piepubli > #likes > #cont').innerHTML = `<p> ${this.likes}</p>`;
    })
    this.shadowRoot.querySelectorAll('#piepubli > #likes >  #dislike > button')[0].addEventListener('click', ()=>{
        this.likes--;
        this.shadowRoot.querySelector('#piepubli > #likes > #cont').innerHTML = `<p> ${this.likes}</p>`;
    })
    

    }
}

// Registro del componente personalizado
customElements.define('publicacion-componente',PublicacionComponente);


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
        let tablon = document.getElementById('tablon');
        let listado = document.querySelectorAll('#tablon > publicacion-componente');
        
        let publicacion = new PublicacionComponente(email, nombre, cuerpo);
        console.log(ordPorLikes);
        if(listado.length>1 && !ordPorLikes){
            if(!compararFecha(listado[0].shadowRoot.querySelector('#piepubli > #hora').textContent,listado[listado.length-1].shadowRoot.querySelector('#piepubli > #hora').textContent)){
                tablon.appendChild(publicacion);
            }else{
                tablon.insertBefore(publicacion, document.getElementById('tablon').firstChild);
            }
        }else{
            tablon.appendChild(publicacion);
        }
        
    
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
}

function obtenerHoraFecha(){
    let date = new Date();
    let fecha = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    let hora = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minuto = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let segundos = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return hora + ":" + minuto + ":" + segundos + " - " + fecha;
  }