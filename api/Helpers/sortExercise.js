// Importar Array de CoordActivoAB
var arrayCoordActivoAB = require('./coordActivoAB');
// Importar Array de CoordActivoGH
var arrayCoordActivoGH = require('./coordActivoGH');
// Importar Array de ProgPre20926100
// var arrayProgPres = require('./ProgPresAB');
// Array de Asignaciones. Es pequeño, puede ir in-text.
var arrayAssignaciones = ['J07','J08','J0A','J0D','J0E','J0H','J0P','J0V','J0W','J0Y','J10','J11','J18','J1B','J1Q','J1V','J22','J27','J2A','J2B','J2G','J2J','J2K','J2M','J2P','J2P','J2Q','J2U','J35','J3B','J3F','J3M','J3Q','J3R','J3S','J3U','J4J','1IA','J2E'];
// Array de GM Trasladadas
var arrayGMTrasladadas = require('./GMTrasladadas');
// Variable para clasificar subdirección
var subdireccion;
// Función a exportar, realiza la clasificación.
function sort(fila, cg, pf, pp, ct, imp) {
    var centro_gestor = fila[cg].toString();
    var posicion_financiera = fila[pf].toString();
    var programa_presupuestal = fila[pp].toString();
    var contrato = fila[ct].toString();
    var importe = parseFloat(fila[imp]);
    var importepositivo = importe *(-1);
    // TODO: Agregar ejemplos consistentes.
    // Creación de substrings para posterior comparación.
    // Las primeras tres letras de posición financiera.
    // Ejemplo:
    var rg = posicion_financiera.substr(0,3);
    // Las siguientes 3 letras a partir de la posición 9.
    // Ejemplo:
    var progtt = programa_presupuestal.substr(8,3);
    // Concatenar centro gestor + programa presupuestal
    // Ejemplo:
    var llave = centro_gestor + programa_presupuestal;
    // Concatenar las primeras tres letras de posición financiera + las siguientes 3 letras
    // a partir de posición financiera.
    // Ejemplo:
    var llavegmetdp2 = progtt+rg;
    // Los dígitos 7 y 8 de Programa presupuestal.
    // Ejemplo:
    var prog = programa_presupuestal.substr(8,2);
    // Los tres siguientes dígitos a partir de la posición 11 de Programa Presupuestal.
    // Ejemplo:
    var campo = programa_presupuestal.substr(11,3);
    // Los dos siguientes dígitos a partir de la posición 11 de Programa Presupuestal.
    // Ejemplo:
    var campo_2 = programa_presupuestal.substr(11,2);
    // Los primeros 3 dígitos de Programa Presupuestal.
    // Ejemplo:
    var asignacion = programa_presupuestal.substr(0,3);
    // El primer caracter de la variable Prog
    // Ejemplo:
    var prog_1 = prog.substr(0,1);
    // Los primeros 3 caracteres de la variable Centro Gestor.
    var centro_gestor_3=centro_gestor.substr(0,3);
    // Los primeros nueve dígitos de la variable contrato
    var contrato_9 = contrato.substr(0,9);    									 //
    //  Aquí empieza la lógica de clasificación  //
    //											 //
    // Fórmula de Excel:
    // =SI(ESERROR(BUSCARV(EXTRAE(Y2,1,3),'Asig BN03'!A:A,1,0)),"NO ASIG",0)
    var clasificadorResp1;
    if (arrayAssignaciones.includes(asignacion)){
        clasificadorResp1 = 0;
    }
    else {
        clasificadorResp1 = 'NO ASIG';
    }
    // Fórmula de Excel:
    //=SI(C2=0,SI(EXTRAE(U2,1,1)="R","GMPELL",0),C2)
    var clasificadorResp2;
    if (clasificadorResp1 === 0) {
        if (prog_1 === 'R') {
            clasificadorResp2 = 'GMPELL';
        }
        else  {
            clasificadorResp2 = 0;
        }
    }
    else {
        clasificadorResp2 = clasificadorResp1;
    }
    // Fórmula de Excel:
    //=SI(D2=0,SI(O(S2="J1",S2="J5",S2="J6",S2="J7",S2="J8",S2="J9",S2="K4",T2="K20"),"GERENCIA",0),D2)
    var clasificadorResp3;
    if (clasificadorResp2 === 0){
        if (campo_2 === 'J1' || campo_2=== 'J5' ||  campo_2==='J6' ||  campo_2==='J7' ||  campo_2==='J8' ||  campo_2==='J9' ||  campo_2==='K4' || campo==='K20'){
            clasificadorResp3 = 'GERENCIA';
        }
        else {
            clasificadorResp3 = 0;
        }
    }
    else {
        clasificadorResp3 = clasificadorResp2;
    }
    // Fórmula de Excel:
    //=SI(E2=0,SI(TEXTO(X2,0)="37010082","GESPD-SPEE",SI(O(EXTRAE(Y2,1,3)="31K",EXTRAE(Y2,1,3)="J2E",TEXTO(X2,0)="41010092",Y2="J22A0000KGYNEH0V"),"GAAAP",0)),E2)
    var clasificadorResp4;
    if (clasificadorResp3 === 0){
        if (centro_gestor === '37010082') {
            clasificadorResp4 = 'GESPD-SPEE';
        }
        else {
            if (asignacion === '31K' || asignacion === 'J2E' || centro_gestor === '41010092' || programa_presupuestal==='J22A0000KGYNEH0V'){
                clasificadorResp4 = 'GAAAP';
            }
            else {
                clasificadorResp4 = 0;
            }
        }
    }
    else {
        clasificadorResp4 = clasificadorResp3;
    }
    // Fórmula de Excel:
    // =SI(F2=0,SI(O(T2="K2K",T2="K2P"),"CORP",0),F2)
    var clasificadorResp5;
    if (clasificadorResp4===0){
        if (campo ==='K2K' || campo==='K2P'){
            clasificadorResp5='CORP';
        }
        else {
            clasificadorResp5 = 0;
        }
    }
    else {
        clasificadorResp5=clasificadorResp4;
    }
    // Fórmula de Excel:
    //=SI(G2=0,SI(Y(O(V2="KGY",V2="KGZ"),TEXTO(X2,0)="23610000"),"GMDE",SI(Y(O(V2="KGY",V2="KGZ"),TEXTO(X2,0)="41010091"),"GMDE",0)),G2)
    var clasificadorResp6;
    if (clasificadorResp5===0){
        if (progtt === 'KGY' || progtt==='KGZ'){
            if (centro_gestor ==='23610000') {
                clasificadorResp6 = 'GMDE';
            }
            else {
                clasificadorResp6 = 0;
            }
        }
        else {
            if (progtt === 'KGY' || progtt==='KGZ'){
                if (centro_gestor ==='41010091') {
                    clasificadorResp6 = 'GMDE';
                }
            }
            else {
                clasificadorResp6 = 0;
            }
        }
    }
    else {
        clasificadorResp6 = clasificadorResp5;
    }
    // Fórmula de Excel:
    //=SI(H2=0,SI(Y(O(B2="PH5308",B2="PH9308"),TEXTO(X2,0)="41010091"),"GMDE",0),H2)
    var clasificadorResp7;
    if (clasificadorResp6===0){
        if (llavegmetdp2 === 'PH5308' || llavegmetdp2==='PH9308'){
            if (centro_gestor==='41010091'){
                clasificadorResp7='GMDE';
            }
            else {
                clasificadorResp7=0;
            }
        }
        else {
            clasificadorResp7=0;
        }
    }
    else {
        clasificadorResp7 = clasificadorResp6;
    }
    // Fórmula de Excel:
    //=SI(I2=0,SI(Y(O(U2="QA",U2="PD",U2="PF",U2="PH",U2="PA"),O(EXTRAE(TEXTO(X2,0),1,3)="223",TEXTO(X2,0)="37010048")),"CSTPIP",0),I2)
    var clasificadorResp8;
    if (clasificadorResp7===0){
        if (prog==='QA' || prog==='PD' || prog==='PF' || prog==='PH' ||prog==='PA'){
            if (centro_gestor_3==='233' || centro_gestor ==='37010048'){
                clasificadorResp8 = 'CSTPIP';
            }
            else {
                clasificadorResp8 = 0;
            }
        }
        else {
            clasificadorResp8 = 0;
        }
    }
    else {
        clasificadorResp8 = clasificadorResp7;
    }
    // Fórmula de Excel:
    //=SI(J2=0,SI(O(TEXTO(X2,0)="41010091",TEXTO(X2,0)="37010042"),SI(Y(O(TEXTO(Z2,0)="309320301",TEXTO(Z2,0)="325455100",TEXTO(Z2,0)="328382100"),U2<>"KG"),"CGDUOS",BUSCARV($A2,'Coord Activo'!$A:$B,2,0)),0),J2)
    var clasificadorResp9;
    if (clasificadorResp8===0){
        if (centro_gestor === '41010091' || centro_gestor === '37010042'){
            if (posicion_financiera === '309320301' || posicion_financiera === '325455100' || posicion_financiera==='328382100'){
                if (prog !== 'KG'){
                    clasificadorResp9 = 'CGDUOS';
                }
            }
            else {
                if (llave in arrayCoordActivoAB){
                    clasificadorResp9 = arrayCoordActivoAB[llave];
                }
            }
        }
        else {
            clasificadorResp9 = 0;
        }
    }
    else {
        clasificadorResp9=clasificadorResp8;
    }

    // Fórmula de Excel:
    //=SI(K2=0,BUSCARV(TEXTO(X2,0),'Coord Activo'!$G:$H,2,0),K2)
    var clasificadorResp10;
    if (clasificadorResp9 === 0){
        if (centro_gestor in arrayCoordActivoGH){
            clasificadorResp10 = arrayCoordActivoGH[centro_gestor];
        }
    }
    else {
        clasificadorResp10 = clasificadorResp9;
    }
    // Fórmula de Excel:
    //=SI(L2="GMSLOT-CMCIT SV",BUSCARV($Y2,ProgPre20926100!$A:$B,2,0),L2)
    //=SI(L2=0,BUSCARV(TEXTO(Y2,0),'Coord Activo'!$G:$H,2,0),L2))
    var clasificadorResp11;
    if (clasificadorResp10===0){
        if (programa_presupuestal in arrayCoordActivoGH){
            clasificadorResp11 = arrayCoordActivoGH[programa_presupuestal];
        }
    }
    else {
        clasificadorResp11 = clasificadorResp10;
    }
    // Aquí se realiza las GM Trasladadas
    // Si la variable contrato existe, busca por coincidencia en GM Trasladadas
    // Si la variable contrato no existe o no encuentra coincidencia en GM Trasladados
    // Regresa el último estado.
    var clasificadorResp12;
    if (clasificadorResp11 && contrato_9){
        if (contrato_9 in arrayGMTrasladadas){
            clasificadorResp12 = arrayGMTrasladadas[contrato_9];
        }
        else {
            clasificadorResp12 =clasificadorResp11;
        }
    }
    else {
        clasificadorResp12 = clasificadorResp11;
    }
    // La de GMOPI que se agrega
    var clasificadorResp13;
    if (clasificadorResp12==='NO ASIG' && asignacion==='J4P' && prog==='PQ'){
        clasificadorResp13 = 'GMOPI';
    }
    else {
        clasificadorResp13 = clasificadorResp12;
    }

    if ( clasificadorResp13 === 'AA' || clasificadorResp13 === 'CGDUOS' || clasificadorResp13 === 'GMDE'
		|| clasificadorResp13 === 'GMGE' || clasificadorResp13 === 'GMM' || clasificadorResp13 === 'GMOPI'){
        subdireccion = 'SPRN APV';
    }
    else {
        if (clasificadorResp13 === 'CSTPIP' || clasificadorResp13 === 'GSMCCIT' || clasificadorResp13 === 'GSSLT'){
            subdireccion = 'SASEP';
        }
        else {
            subdireccion = '';
        }
    }
    fila.unshift(importepositivo);
    fila.unshift(subdireccion);
    fila.unshift(clasificadorResp13);
    return fila;


}
module.exports = { sort };
