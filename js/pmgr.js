"use strict"

import * as Pmgr from './pmgrapi.js'

/**
 * Librería de cliente para interaccionar con el servidor de PrinterManager (prmgr).
 * Prácticas de IU 2020-21
 *
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas. Recomiendo separar el fichero en 2 partes:
 * - funciones que pueden generar cachos de contenido a partir del modelo, pero que no
 *   tienen referencias directas a la página
 * - un bloque rodeado de $(() => { y } donde está el código de pegamento que asocia comportamientos
 *   de la parte anterior con elementos de la página.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él, que es esencialmente
 * lo que quieras siempre y cuando no digas que lo escribiste tú o me persigas por haberlo escrito mal.
 */

//
// PARTE 1:
// Código de comportamiento, que sólo se llama desde consola (para probarlo) o desde la parte 2,
// en respuesta a algún evento.
//


function statusToSVG(state, desiredSize) {
  const PS = Pmgr.PrinterStates;
  switch (state) {
    case PS.PRINTING:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-printer-fill"
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5z" />
        <path fill-rule="evenodd"
            d="M11 9H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
        <path fill-rule="evenodd"
            d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
      </svg> <!-- icono impresora -->
      `;
      break;

    case PS.PAUSED:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-pause-fill" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
      </svg>  <!-- icono paused -->
          `;
      break;

    case PS.NO_INK:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-droplet-half" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
        <path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/>
      </svg>  <!-- icono no-ink -->
          `;
      break;

    case PS.NO_PAPER:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-file-earmark-excel-fill" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M2 2a2 2 0 0 1 2-2h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm7.5 1.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
      </svg> 
          `;
      break;

    default:

  }
}

function createPrinterItem(printer) {
  const rid = 'x_' + Math.floor(Math.random() * 1000000);
  const hid = 'h_' + rid;
  const cid = 'c_' + rid;

  // usar [] en las claves las evalua (ver https://stackoverflow.com/a/19837961/15472)
  const PS = Pmgr.PrinterStates;
  let pillClass = {
    [PS.PAUSED]: "badge-secondary",
    [PS.PRINTING]: "badge-success",
    [PS.NO_INK]: "badge-danger",
    [PS.NO_PAPER]: "badge-danger"
  };

  // Lista de grupos a los que pertenece la impresora "printer"
  let printerGroups = Pmgr.globalState.groups
    .filter((g) => g.printers.indexOf(printer.id) > -1)
    .map((g) =>
      `<span class="badge badge-secondary">${g.name}</span>`
    ).join(" ");

  return `
    <div class="card">
      <div class="card-header" id="${hid}">
        <h2 class="mb-0">
        <button class="btn btn-link w-100" type="button"
                data-toggle="collapse" data-target="#${cid}",
                aria-expanded="false" aria-controls="#${rid}">
          <div class="row w-100">
            <div class="col">
              <b class="pcard">${printer.alias}</b>
            </div>

            <!-- Comentado
                <span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>
            -->

            <div class="col">  
              <div class="text right">            
                  ${statusToSVG(printer.status, 2.2)}
              </div>
            </div>
          </div>
        </button>
        </h2>
      </div>

      <div id="${cid}" class="collapse hide" aria-labelledby="${hid}
        data-parent="#imIzLista">
        <div class="card-body pcard">
          ${printerGroups}
        </div>
      </div>
    </div >
        `;
}

// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
  const U = Pmgr.Util;

  // genera datos de ejemplo
  minPrinters = minPrinters || 10;
  maxPrinters = maxPrinters || 20;
  minGroups = minGroups || 1;
  maxGroups = maxGroups || 3;
  jobCount = jobCount || 100;
  let lastId = 0;

  let printers = U.fill(U.randomInRange(minPrinters, maxPrinters),
    () => U.randomPrinter(lastId++));

  let groups = U.fill(U.randomInRange(minPrinters, maxPrinters),
    () => U.randomGroup(lastId++, printers, 50));

  let jobs = [];
  for (let i = 0; i < jobCount; i++) {
    let p = U.randomChoice(printers);
    let j = new Pmgr.Job(lastId++,
      p.id,
      [
        U.randomChoice([
          "Alice", "Bob", "Carol", "Daryl", "Eduardo", "Facundo", "Gloria", "Humberto"]),
        U.randomChoice([
          "Fernández", "García", "Pérez", "Giménez", "Hervás", "Haya", "McEnroe"]),
        U.randomChoice([
          "López", "Gutiérrez", "Pérez", "del Oso", "Anzúa", "Báñez", "Harris"]),
      ].join(" "),
      U.randomString() + ".pdf");
    p.queue.push(j.id);
    jobs.push(j);
  }

  if (Pmgr.globalState.token) {
    console.log("Updating server with all-new data");

    // FIXME: remove old data
    // FIXME: prepare update-tasks
    let tasks = [];
    for (let t of tasks) {
      try {
        console.log("Starting a task ...");
        await t().then(console.log("task finished!"));
      } catch (e) {
        console.log("ABORTED DUE TO ", e);
      }
    }
  } else {
    console.log("Local update - not connected to server");
    Pmgr.updateState({
      jobs: jobs,
      printers: printers,
      groups: groups
    });
  }
}

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").cosaQueSucede(...)
//
$(function () {

  // funcion de actualización de ejemplo. Llámala para refrescar interfaz
  function update(result) {
    try {
      // vaciamos un contenedor
      $("#imIzLista").empty();
      // y lo volvemos a rellenar con su nuevo contenido
      Pmgr.globalState.printers.forEach(m => $("#imIzLista").append(createPrinterItem(m)));
      // y asi para cada cosa que pueda haber cambiado
    } catch (e) {
      console.log('Error actualizando', e);
    }
  }


  // Servidor a utilizar. También puedes lanzar tú el tuyo en local (instrucciones en Github)
  const serverUrl = "http://localhost:8080/api/";
  Pmgr.connect(serverUrl);

  // ejemplo de login
  Pmgr.login("HDY0IQ", "cMbwKQ").then(d => {
    if (d !== undefined) {
      const u = Gb.resolve("HDY0IQ");
      console.log("login ok!", u);
    } else {
      console.log(`error en login(revisa la URL: ${serverUrl}, y verifica que está vivo)`);
      console.log("Generando datos de ejemplo para uso en local...")

      populate();
      update();
    }
  });
});

// cosas que exponemos para usarlas desde la consola
window.populate = populate
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem


