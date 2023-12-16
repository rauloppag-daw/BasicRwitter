<?php


aplicacion();


function aplicacion(){
    $conexion = new PDO('mysql:host=localhost;dbname=rwitter', 'root', '');
    if(isset($_GET['function'])){
        if($_GET['function'] == 1){
            devolverRweets($conexion);
        }else if($_GET['function'] == 2){
            anyadirRweet($conexion);
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
        array_push($rweets, array('email'=>$r['email'], 'nombre'=>$r['nombre'], 'cuerpo'=>$r['cuerpo'],  'likes'=>$r['likes'],  'fecha'=>$r['fecha']));
    }

    echo json_encode($rweets);
}

function anyadirRweet($conexion){
    $_post = json_decode(file_get_contents('php://input'),true);
    $sql = 'INSERT INTO rweets (email, nombre, cuerpo, likes, fecha ) VALUES (:e, :n, :c, :l, :f)';
    $sentencia = $conexion->prepare($sql);
    $sentencia->bindParam(':e', $_post['email']);
    $sentencia->bindParam(':n', $_post['nombre']);
    $sentencia->bindParam(':c', $_post['cuerpo']);
    $sentencia->bindParam(':l', $_post['likes']);
    $sentencia->bindParam(':f', $_post['fecha']);
    $isOk = $sentencia->execute();
}

