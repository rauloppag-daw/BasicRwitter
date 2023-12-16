<?php


aplicacion();


function aplicacion(){
    $conexion = new PDO('mysql:host=localhost;dbname=rwitter', 'root', '');
    if(isset($_GET['function'])){
        if($_GET['function'] == 1){
            devolverRweets($conexion);
        }
    }
}


function devolverRweets($conexion){
    $sql = 'SELECT * FROM rweets';
    $sentencia = $conexion->prepare($sql);
    $sentencia -> setFetchMode(PDO::FETCH_ASSOC);
    $isOk = $sentencia->execute();
    $rweetsBBDD = $sentencia->fetchAll();
    $rweets = array();

    foreach($rweetsBBDD as $r){
        array_push($rweets, array('email'=>$r['email'], 'nombre'=>$r['nombre'], 'cuerpo'=>$r['cuerpo']));
    }

    echo json_encode($rweets);
}