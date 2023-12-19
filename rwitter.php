<?php


aplicacion();

/**
 * Funcion que inicia la aplicación y controla la variable GET[function] para decidir que acción hacer
 */
function aplicacion(){
    $conexion = new PDO('mysql:host=localhost;dbname=rwitter', 'root', '');
    if(isset($_GET['function'])){
        if($_GET['function'] == 1){
            devolverRweets($conexion);
        }else if($_GET['function'] == 2){
            anyadirRweet($conexion);
            devolverRweets($conexion);
        }else if($_GET['function'] == 3){
            likear($conexion);
        }else if($_GET['function'] == 4){
            borrarRweet($conexion);
            devolverRweets($conexion);
        }else if($_GET['function'] == 5){
            modificarRweet($conexion);
            devolverRweets($conexion);
        }
    }
}
/**
 * Función que modifica los rweets de la BBDD
 */
function modificarRweet($conexion){
    $_post = json_decode(file_get_contents('php://input'),true);
    $sql = 'UPDATE rweets SET email = :e, nombre = :n, cuerpo = :c WHERE id = :i';
    $sentencia = $conexion->prepare($sql);
    $sentencia->bindParam(':e', $_post['email']);
    $sentencia->bindParam(':n', $_post['nombre']);
    $sentencia->bindParam(':c', $_post['cuerpo']);
    $sentencia->bindParam(':i', $_post['codigo']);
    $isOk = $sentencia->execute();
}

/**
 * Devuelve mediante echo todos los rweets
 */
function devolverRweets($conexion){
    $sql = 'SELECT * FROM rweets';
    $sentencia = $conexion->prepare($sql);
    $sentencia -> setFetchMode(PDO::FETCH_ASSOC);
    $isOk = $sentencia->execute();
    $rweetsBBDD = $sentencia->fetchAll();
    $rweets = array();

    foreach($rweetsBBDD as $r){
        array_push($rweets, array('codigo' => $r['id'], 'email'=>$r['email'], 'nombre'=>$r['nombre'], 'cuerpo'=>$r['cuerpo'],  'likes'=>$r['likes'],  'fecha'=>$r['fecha']));
    }

    echo json_encode($rweets);
}
/**
 * Añade un rweet a la base de datos mediante POST
 */
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

/**
 * Función que actualiza los likes de una publicación
 */
function likear($conexion){
    $_post = json_decode(file_get_contents('php://input'),true);

    $sql = 'SELECT likes FROM rweets WHERE id = :c';
    $sentencia = $conexion->prepare($sql);
    $sentencia->bindParam(':c', $_post['codigo']);
    $sentencia -> setFetchMode(PDO::FETCH_ASSOC);
    $isOk = $sentencia->execute();
    $likesBBDD = $sentencia->fetch();

    $likesTotal = $likesBBDD['likes'] + $_post['val'];
 
    $sql = 'UPDATE rweets SET likes = :l WHERE id = :c';
    $sentencia = $conexion->prepare($sql);
    $sentencia->bindParam(':c', $_post['codigo']);
    $sentencia->bindParam(':l', $likesTotal);
    $isOk = $sentencia->execute();

    echo $likesTotal;
}
/**
 * Borra un rweet dado un codigo
 */
function borrarRweet($conexion){
    $_post = json_decode(file_get_contents('php://input'),true);
    $sql = 'DELETE FROM rweets WHERE id = :c';
    $sentencia = $conexion->prepare($sql);
    $sentencia->bindParam(':c', $_post['codigo']);
    $isOk = $sentencia->execute();
}
